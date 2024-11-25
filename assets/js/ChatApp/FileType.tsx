import React, {useState} from "react"
import SyntaxHighlighter from "react-syntax-highlighter";
import {vs2015} from "react-syntax-highlighter/dist/esm/styles/hljs";

export interface FileType {
    type: string,
    subtype:string,
    content: string | ArrayBuffer | null | undefined,
    name: string,
    size: number,
    lastModified:number,
    file:File
}


export const FileTypeView = ({filetype, callback, ...props}:{filetype:FileType, callback:(e:React.MouseEvent<HTMLButtonElement>)=>void})=>{

    const [docs, setDocs] = useState([]);



    if(filetype.type == "image"){
        return (
            <div className="view-file">
                <div className="img-view">
                    <button onClick={callback} className="close">&times;</button>
                    <img src={filetype.content?.toString()} alt=""/>
                </div>
            </div>
        )
    }else if(filetype.type == "video"){
        return (
            <div className="view-file">
                <div className="video-view">
                    <button onClick={callback} className="close">&times;</button>
                    <video controls>
                        <source src={filetype.content?.toString()} type="video/mp4"/>
                    </video>
                </div>
            </div>
        )
    }else if(filetype.type == "application"){
        if(filetype.subtype == "pdf"){
            return (
                <div className="view-file">
                    <div className="pdf-view">
                        <button onClick={callback} className="close">&times;</button>
                        <iframe title="pdf" src={filetype.content?.toString()} width="100%" height="500px"></iframe>
                    </div>
                </div>
            )
        }else {
            return (
                <div className="view-file">
                    <div className="outher-view">
                        <button onClick={callback} className="close">&times;</button>
                        <div className="file-view-flex">
                            <i className="fas fa-file"></i>
                            <div className="file-view-flex-text">
                                <a href={filetype.content?.toString()} download>{filetype.name}</a>
                                <span>Arquivo</span>
                            </div>
                            
                        </div>
                    </div>
                </div>
            )
        }
    }else{
        return (
            <div className="view-file">
                <div className="outher-view">
                    <button onClick={callback} className="close">&times;</button>
                    <div className="file-view-flex">
                        <h3><i className="fas fa-file"></i></h3>
                        <div className="file-view-flex-text">
                            <a href={filetype.content?.toString()} download={filetype.name}>{filetype.name}</a>
                            <span>Arquivo</span>
                        </div>
                    </div>
                </div>
            </div>
        )
        
    }
}

export const FileViewChat = ({type, subtype, content, conversation_id}:{type:string, subtype:string, content:string, conversation_id:string|undefined})=>{
   if (type == "image"){
        return (
            <div className="view-file">
                <div className="img-view">
                    <img src={`http://localhost:5000/getfile/${conversation_id}/${content}`} alt=""/>
                </div>
            </div>
        )
   }
}