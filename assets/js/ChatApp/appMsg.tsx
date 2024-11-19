import React, {useEffect, useState, useRef} from "react";
import { CategorizedConversations, Conversation, ConversationsView, Message } from "./conversations";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { MessagesView } from "./messages";

async function getUser(){
    const response = await axios.get(`https://localhost:8000/api/`);
    return response.data
}

function diasPassados(data:any) {
    const hoje:any = new Date();
    const umDia = 1000 * 60 * 60 * 24; // milissegundos em um dia
    return Math.floor((hoje - data) / umDia);
}



interface User {
    id:string,
    username:string,
    conversations:Conversation[],
}


async function sendMsg(conversation_id:string) {
    //const axios = require('axios');
    let data = JSON.stringify({
        "conversation_id": conversation_id
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://localhost:8000/api/sendMsg',
        headers: { 
            'Content-Type': 'application/json', 
            'Cookie': 'PHPSESSID=1b16k3qo4u4lac49d0pa0rv4ed'
        },
        data : data
    };

    const responseDataMsg = await axios.request(config).then(async (response:any)=>{
        const dataSend = response.data;
        const dataMsgSend = JSON.stringify(dataSend)
        let configreq = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://localhost:5000/chatCreate',
            headers: { 
              'Content-Type': 'application/json'
            },
            data : dataMsgSend
          };
        const responseCreate = await axios.request(configreq).then((responseCreateMsg:any)=>{
            return responseCreateMsg.data
        })

        const dataSave = JSON.stringify({
            conversation_id:conversation_id,
            result: responseCreate
        })

        let configSaveReq = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://localhost:8000/api/saveMsg',
            headers: { 
              'Content-Type': 'application/json'
            },
            data : dataSave
        }

        const responseSave = await axios.request(configSaveReq).then((resSave:any)=>{
            return resSave.data
        })


        //const responseMsg = 
        return responseSave
    });
    


    return responseDataMsg
}

async function sendMsgChat(conversation_id:string, prompt:string){
    const data = {
        conversation_id: conversation_id,
        prompt: prompt,
    }

    const datapost = JSON.stringify(data)

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://localhost:8000/api/sendMsgByConversation',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : datapost
    };

    const response = await axios.request(config).then(async(responseData:any)=>{
        const dataChat = JSON.stringify(responseData.data)
        let configChat = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://localhost:5000/chat',
            headers: { 
              'Content-Type': 'application/json'
            },
            data : dataChat
        };
        const responseChat = await axios.request(configChat).then((resChat:any)=>{
            return resChat.data
        })

        const dataSave = JSON.stringify({
            conversation_id:conversation_id,
            result: responseChat
        })

        let configSaveReq = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://localhost:8000/api/saveMsg',
            headers: { 
              'Content-Type': 'application/json'
            },
            data : dataSave
        }

        const responseSave = await axios.request(configSaveReq).then((resSave:any)=>{
            return resSave.data
        })

        return responseSave
    });

    return response
}

const AppMsg = ()=>{
    const [user, setUser] = useState<User>()
    const [conversations, setConversations] = useState<CategorizedConversations>()
    const [username, setUserName] = useState<any>("")
    const [conversation, setConversation] = useState<Conversation>()
    const [prompt, setPrompt] = useState<string>("")
    const [loadding, setLoadding] = useState<boolean>(false)
    const [submitbtnDisabled, setSetSubmitDisabled] = useState<boolean>(true)
 
    const {id} = useParams()
    const navigate = useNavigate()

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const onSubimit = (e:any)=>{
        let conversation = user?.conversations.find((conversation:Conversation) => conversation.id == id)
        if (conversation != undefined){
            const humman_msg:Message = {
                id: crypto.randomUUID(),
                msg: prompt,
                file: null,
                type: "Humman"
            }
            conversation.messages.push(humman_msg)
            setConversation(conversation)
        }
        setLoadding(true)
        
        sendMsgChat(id!, prompt).then((data:any)=>{
            const conversationNew:Conversation = {
                id: data["id"],
                titulo: data["titulo"],
                model:data["model"],
                date: data["date"],
                messages: data["messages"],
                prompt: data["prompt"],
                execute_prompt: data["execute_prompt"],
                file_prompt: data["file_prompt"],
                user_id: data["user_id"]
            }
            getUser().then((datauser:any) => {
                const categorizedConversations = categorizeByTime(datauser["conversations"]);
                setUserName(datauser.username)
                setConversations(categorizedConversations);
                const userData: User = {
                    id:datauser.id,
                    username:datauser.username,
                    conversations:datauser["conversations"]
                }
    
                setUser(userData)
            })
            setConversation(conversationNew)
            setLoadding(false)
        })

        setTimeout(() => {
            const conversationView = document.querySelector(".conversation-view") as HTMLElement
            conversationView.scrollTo({top:conversationView.scrollHeight, behavior: "smooth" });
        }, 0);
        setPrompt("")
        
    }



    const handleChange = (e: any) => {
        if(e.target.value){
            setSetSubmitDisabled(false)
        }else {
            setSetSubmitDisabled(true)
        }
        setPrompt(e.target.value);
    };

    const keydown = (e: any) => {
        const value = e.target.value;
        // Se o usuário pressionar Shift + Enter, apenas adiciona uma nova linha
        if (e.keyCode === 13 && e.shiftKey) {
            e.preventDefault();
            setPrompt(value + "\n");
        } else if (e.keyCode === 13 && !e.shiftKey) {
            // Se o usuário pressionar apenas Enter, dispara o envio
            e.preventDefault();
            const sendBtn: any = document.querySelector(".send-button");
            sendBtn.click();
        }
    };

    useEffect(()=>{
        getUser().then((data:any) => {
            const categorizedConversations = categorizeByTime(data["conversations"]);
            setUserName(data.username)
            setConversations(categorizedConversations);
            const userData: User = {
                id:data.id,
                username:data.username,
                conversations:data["conversations"]
            }

            setUser(userData)
        })
    }, [])

    useEffect(()=>{
        if(id != undefined){
            let conversation = user?.conversations.find((conversation:Conversation) => conversation.id == id)
            if (conversation != undefined){
                if(conversation.execute_prompt === false){
                    const humman_msg:Message = {
                        id: crypto.randomUUID(),
                        msg: conversation.prompt,
                        file: (conversation.file_prompt != null) ? conversation.file_prompt : null,
                        type: "Humman"
                    }
                    conversation.messages.push(humman_msg)
                    setLoadding(true)

                }
                setConversation(conversation)

                if(conversation.execute_prompt === false){
                    sendMsg(conversation.id).then(data=>{
                        const conversationNew:Conversation = {
                            id: data["id"],
                            titulo: data["titulo"],
                            model:data["model"],
                            date: data["date"],
                            messages: data["messages"],
                            prompt: data["prompt"],
                            execute_prompt: data["execute_prompt"],
                            file_prompt: data["file_prompt"],
                            user_id: data["user_id"]
                        }
                        getUser().then((datauser:any) => {
                            const categorizedConversations = categorizeByTime(datauser["conversations"]);
                            setUserName(datauser.username)
                            setConversations(categorizedConversations);
                            const userData: User = {
                                id:datauser.id,
                                username:datauser.username,
                                conversations:datauser["conversations"]
                            }
                
                            setUser(userData)
                        })
                        setConversation(conversationNew)
                        setLoadding(false)
                   })
                }
            }
        }
    }, [user,id])

    useEffect(()=>{
       adjustTextareaHeight()
    }, [prompt])

   
    const categorizeByTime = (data: Conversation[]): CategorizedConversations => {
        const categorized: CategorizedConversations = {
            hoje: [],
            ontem: [],
            seteDias: [],
            trintaDias: [],
            maisAntigo: []
        };
    
    
        data.forEach((conversation) => {
            
            const dias = diasPassados(new Date(conversation.date));

            if (dias === 0) {
                categorized.hoje.push(conversation);
            } else if (dias === 1) {
                categorized.ontem.push(conversation);
            } else if (dias <= 7) {
                categorized.seteDias.push(conversation);
            } else if (dias <= 30) {
                categorized.trintaDias.push(conversation);
            } else {
                categorized.maisAntigo.push(conversation);
            }
        });

        return categorized;
    };

    const hideSidBar = ()=>{
        const sidebar:Element | any = document.querySelector("#sidebar");
        sidebar.classList.toggle( "hidden" );
    }

    const showUserMenu = ()=>{
        const user_menu:Element|any = document.querySelector(".user-menu ul");
        if( user_menu.classList.contains("show") ) {
            user_menu.classList.toggle( "show" );
            setTimeout( function() {
                user_menu.classList.toggle( "show-animate" );
            }, 200 );
        } else {
            user_menu.classList.toggle( "show-animate" );
            setTimeout( function() {
                user_menu.classList.toggle( "show" );
            }, 50 );
        }
    }

    const getPrimeiraLetra = (userName:string)=>{
        return userName.charAt(0).toUpperCase()
    }

    const navigateToMain = () => {
        navigate("/")
    }

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            const maxHeight = 150; // Altura máxima do textarea em pixels
            textareaRef.current.style.height = "auto"; // Reseta a altura para re-calcular

            // Ajusta a altura para o tamanho do conteúdo, mas limita ao máximo
            if (textareaRef.current.scrollHeight <= maxHeight) {
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            } else {
                textareaRef.current.style.height = `${maxHeight}px`;
                textareaRef.current.style.overflowY = "auto"; // Adiciona o scroll
            }
        }
    };

    useEffect(() => {
        // Inicializar a altura do textarea quando o componente for montado
        adjustTextareaHeight();
    }, []);

    return (
        <div className="content-view">
            <nav id="sidebar">
                <div className="float-top">
                    <div className="sidebar-controls">
                        <button onClick={navigateToMain} className="new-chat"><i className="fa fa-plus"></i> Novo chat</button>
                        <button  onClick={hideSidBar} className="hide-sidebar"><i className="fa fa-chevron-left"></i></button>
                    </div>
                    <ul className="conversations">
                        <ConversationsView conversations={conversations}/>
                    </ul>
                </div>
                <div className="user-menu">
                    <button onClick={showUserMenu}>
                        <i className="user-icon">{getPrimeiraLetra(username)}</i>
                            {username}
                        <i className="fa fa-ellipsis dots"></i>
                    </button>
                    <ul>
                        <li><button>My plan</button></li>
                        <li><button>Custom instructions</button></li>
                        <li><button>Settings &amp; Beta</button></li>
                        <li><a href="/logout" className="logout">Sair</a></li>
                    </ul>
                </div>
            </nav>
            <main>
                <MessagesView loadding={loadding} userLetra={getPrimeiraLetra(username)} conversation={conversation}/>
                <div id="message-form">
                    <div className="message-wrapper">
                        <textarea ref={textareaRef} onChange={handleChange} onKeyDown={keydown} id="message" rows={1} placeholder="Send a message" value={prompt}></textarea>
                        <button disabled={submitbtnDisabled} onClick={onSubimit} className="send-button"><i className="fa fa-paper-plane"></i></button>
                        <button className="file-button"><i className="fa-solid fa-paperclip"></i></button>
                    </div>
                </div>
                
            </main>
        </div>
    )
}


export default AppMsg;