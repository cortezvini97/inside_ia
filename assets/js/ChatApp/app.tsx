import React, {useEffect, useState, useRef} from "react";
import { CategorizedConversations, Conversation, ConversationsView, Message } from "./conversations";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FileType, FileTypeView } from "./FileType";

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





const App = ()=>{
    
    const [model, setModel] = useState<string>("gemini-1.5-flash")
    const [user, setUser] = useState<User>()
    const [conversations, setConversations] = useState<CategorizedConversations>()
    const [username, setUserName] = useState<any>("")
    const [conversation, setConversation] = useState<Conversation>()
    const [prompt, setPrompt] = useState<string>("")
    const [loadding, setLoadding] = useState<boolean>(false)
    const [submitbtnDisabled, setSetSubmitDisabled] = useState<boolean>(true)
    const [fileType, setFileType] = useState<FileType|null>(null)
 
    const navigate = useNavigate()

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
       adjustTextareaHeight()
    }, [prompt])

    useEffect(()=>{
        console.log(fileType)
    }, [fileType])

    useEffect(() => {
        // Inicializar a altura do textarea quando o componente for montado
        adjustTextareaHeight();
    }, []);


    const onSubimit = (e:any)=>{
        const dataPost = {
            "prompt": prompt,
            "file": (fileType != null) ? fileType.content : null,
            "model": model,
        }

        const data = JSON.stringify(dataPost)

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://localhost:8000/api/conversations',
            headers: { 
                'Content-Type': 'application/json',
            },
            data : data
        };
              
        axios.request(config).then((response) => {
            const data = response.data
            getUser().then((dataUser:any) => {
                const categorizedConversations = categorizeByTime(dataUser["conversations"]);
                setUserName(dataUser.username)
                setConversations(categorizedConversations);
                const userData: User = {
                    id:dataUser.id,
                    username:dataUser.username,
                    conversations:dataUser["conversations"]
                }
                setUser(userData)
                navigate(`/chat/${data.id}`)
            })
                
        }).catch((error) => {
            console.log(error);
        });
        
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

   

    const handleloadFileUpload = () => {
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        fileInput.click();
    }

   
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            console.log("Arquivos selecionados:", files); // Manipule os arquivos conforme necessário
            const file:File = files[0];
            const fileReader = new FileReader()
            fileReader.onload = (event: ProgressEvent<FileReader>) => {
                const fileContent = event.target?.result; // Conteúdo do arquivo
                
                const type = file.type.split("/")
                
                const typeFile:FileType = {
                    name:file.name,
                    type: type[0],
                    subtype: type[1],
                    content:fileContent,
                    size:file.size,
                    lastModified: file.lastModified,
                    file:file
                }

                setFileType(typeFile)
            };
    
            // Lê o arquivo como texto (use outro método, como `readAsDataURL` para imagens)
            fileReader.readAsDataURL(file);
        }
    };
   
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


    const selectModel = (e:React.MouseEvent<HTMLButtonElement>)=>{
        const targetButton = e.currentTarget  as HTMLButtonElement;
        const value = targetButton.getAttribute('data-value')
        if (value == "gemini-1.5-flash"){
            setModel("gemini-1.5-flash")
            document.querySelector(".gpt-4")?.classList.remove("selected")
            targetButton.classList.add("selected")
        }else {
            setModel("gemini-1.5-pro")
            document.querySelector(".gpt-3")?.classList.remove("selected")
            targetButton.classList.add("selected")
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


    const removeCurrentFileType = (e:React.MouseEvent<HTMLButtonElement>)=>{
        const fileInput = document.querySelector("#file-input") as HTMLInputElement
        fileInput.value = ""
        setFileType(null)
    }
  
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
                <div className="view new-chat-view">
                    <div className="model-selector"  data-model={model}>
                        <button onClick={selectModel} data-value="gemini-1.5-flash" className="gpt-3 selected">
                            <i className="fa fa-bolt"></i> Gemini
                            <div className="model-info">
                                <div className="model-info-box">
                                    <p>Our fastest model, great for most every day tasks.</p>

                                    <p className="secondary">Available to Free and Plus users</p>
                                </div>
                            </div>
                        </button>
                        <button onClick={selectModel}  data-value="gemini-1.5-pro" className="gpt-4">
                            <i className="fa fa-wand-magic-sparkles"></i> Gemini-Pro
                            <div className="model-info">
                                <div className="model-info-box">
                                    <p>Our most capable model, great for creative stuff.</p>

                                    <p className="secondary">Available for Plus users.</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="logo">
                        Chat UI
                    </div>
                </div>
                <div id="message-form">
                    <div className="files-view">
                        {fileType != null ?
                            <FileTypeView filetype={fileType} callback={removeCurrentFileType} />
                        :null}
                    </div>
                    <div className="message-wrapper-center">
                        <div className="message-wrapper">
                            <textarea ref={textareaRef} onChange={handleChange} onKeyDown={keydown} id="message" rows={1} placeholder="Send a message" value={prompt}></textarea>
                            <button disabled={submitbtnDisabled} onClick={onSubimit} className="send-button"><i className="fa fa-paper-plane"></i></button>
                            <button onClick={handleloadFileUpload} className="file-button"><i className="fa-solid fa-paperclip"></i></button>
                            <input
                                id="file-input"
                                type="file"
                                style={{ display: "none" }}
                                onChange={onFileChange}
                            />
                        </div>
                    </div>
                </div>
                
            </main>
        </div>
    )
}


export default App;