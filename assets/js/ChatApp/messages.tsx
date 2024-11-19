import React from "react";
import { Conversation, Message } from "./conversations";
import ReactMarkdown from "react-markdown";
import {vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { FileType, FileViewChat } from "./FileType";

export const MessagesView = ({conversation, userLetra, loadding}:{conversation:Conversation|undefined, userLetra:string, loadding:boolean})=>{
    
    const copyToClipboard = (code: string,  e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const target = e.currentTarget;
        navigator.clipboard.writeText(code).then(() => {
            const contentbtn:any = target.querySelector('div.content-btn');
            const original_html = contentbtn.innerHTML
            console.log(original_html)
            contentbtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.0633 5.67387C18.5196 5.98499 18.6374 6.60712 18.3262 7.06343L10.8262 18.0634C10.6585 18.3095 10.3898 18.4679 10.0934 18.4957C9.79688 18.5235 9.50345 18.4178 9.29289 18.2072L4.79289 13.7072C4.40237 13.3167 4.40237 12.6835 4.79289 12.293C5.18342 11.9025 5.81658 11.9025 6.20711 12.293L9.85368 15.9396L16.6738 5.93676C16.9849 5.48045 17.607 5.36275 18.0633 5.67387Z" fill="currentColor"></path></svg> Copiado!`
            setTimeout(()=>{
                contentbtn.innerHTML = original_html
            }, 1500);
        }).catch(err => {
            console.error("Erro ao copiar o código:", err);
        });
    };

    const mouseEnterHandler = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
        const target = e.currentTarget;
        const spanElement:any = target.querySelector('span.balao');
        if (spanElement) {
            // Altera o display para block
            spanElement.style.display = 'block';
        }
    }

    const mouseLeaveHandle = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
        const target = e.currentTarget;
        const spanElement:any = target.querySelector('span.balao');
        if (spanElement) {
            // Altera o display para block
            spanElement.style.display = 'none';
        }
    }


    const getFileType = (fileData:string)=>{

        const file = fileData.split(";")
        const mimeType = file[0];
        
        const type = mimeType.split("/")[0];
        const subtype = mimeType.split("/")[1];

        console.log(subtype)
        

       return (
        <FileViewChat type={type} subtype={subtype} conversation_id={conversation?.id} name={file[1]}/>
       )
        
        
    }

    const MessageView = ()=>{
        if(conversation != undefined){
            return (
                <div className="view conversation-view">
                    {conversation.model == "gemini-1.5-flash" ?
                        <div className="model-name">
                            <i className="fa fa-bolt"></i> Default (Gemini)
                        </div>:
                        <div className="model-name">
                            <i className="fa fa-wand-magic-sparkles"></i> Gemini-Pro
                        </div>
                    }
                    {conversation.messages.map((message:Message)=>{
                        if(message.type == "Humman"){
                            return (
                                <div className="user message" key={message.id}>
                                    <div className="identity">
                                        <i className="user-icon">{userLetra}</i>
                                    </div>
                                    <div className="content">
                                        {message.file != null ?
                                            getFileType(message.file)
                                        :null}
                                        <p>{message.msg}</p>
                                    </div>
                                </div>
                            )

                        }else {
                            return (
                                <div className="assistant message" key={message.id}>
                                    <div className="identity">
                                        <i className="gpt user-icon"><i className="fa-solid fa-robot"></i></i>
                                    </div>
                                    <div className="content">
                                        <ReactMarkdown
                                            children={message.msg}
                                            components={{
                                                code({
                                                    node,
                                                    className,
                                                    children,
                                                    ...props
                                                }: any) {
                                                    const match = /language-(\w+)/.exec(className || "");
                                                    const codeString = String(children).replace(/\n$/, "");
                                                    return !match ? (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                ) : (
                                                        <div className="code-view">
                                                            <div className="code-view-header">
                                                                <span>{className.split("language-").join("")}</span>
                                                                <button onClick={(e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => copyToClipboard(codeString, e)} onMouseEnter={(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>mouseEnterHandler(e)} onMouseLeave={(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>mouseLeaveHandle(e)}>
                                                                    <div className="content-btn">
                                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-sm">
                                                                            <path fillRule="evenodd" clipRule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path>
                                                                        </svg>
                                                                        Copiar Código
                                                                    </div>
                                                                    <span className="balao">Copiar</span>
                                                                </button>
                                                            </div>
                                                            <SyntaxHighlighter 
                                                                style={vs2015} // Você pode escolher outro tema aqui
                                                                language={match[1]}
                                                                PreTag="div"
                                                                {...props} >
                                                                {String(children).replace(/\n$/, "")}
                                                            </SyntaxHighlighter>
                                                        </div>
                                                        
                                                    );
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        }
                    })}
                    {loadding == true ?
                        <div className="assistant message">
                            <div className="identity">
                                <i className="gpt user-icon"><i className="fa-solid fa-robot"></i></i>
                            </div>
                            <div className="content">
                                <div className="loader">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            </div>
                        </div>
                        :<div></div>
                    }
                </div>
            )
        }else {
            return <div></div>
        }
    }

    return (
        <MessageView />
    )
}