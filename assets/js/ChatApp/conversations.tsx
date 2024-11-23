import React from "react";
import { Link, useParams } from "react-router-dom";

export type Message = {
    id: string;
    type: "Humman" | "IA";  // Ajustando para os tipos que você possui
    file: string|null|undefined;
    msg: string;
};

export type Conversation = {
    id: string;
    user_id: number;
    prompt:string,
    execute_prompt:boolean,
    titulo: string;
    model: string;
    date: string;
    file_prompt: string| null,
    messages: Message[];
};

export type CategorizedConversations = {
    hoje: Conversation[];
    ontem: Conversation[];
    seteDias: Conversation[];
    trintaDias: Conversation[];
    maisAntigo: Conversation[];
};

export const ConversationsView = ({ conversations }: { conversations: CategorizedConversations | undefined }) => {
    const {id} = useParams();
    return (
        <>
            {conversations != undefined && conversations.hoje.length > 0 && (
                <>
                    <li className="grouping">Hoje</li>
                    {conversations.hoje.map((conversation:Conversation)=>{
                        return (
                            <li className={id != undefined && id == conversation.id ? "active" :""} key={conversation.id}>
                                <Link to={`/chat/${conversation.id}`} className="conversation-button links"><i className="fa fa-message fa-regular"></i> {conversation.titulo}</Link>
                                <div className="fade"></div>
                                <div className="edit-buttons">
                                    <button><i className="fa fa-edit"></i></button>
                                    <button><i className="fa fa-trash"></i></button>
                                </div>
                            </li>
                        )
                    })}
                </>
            )}
            {conversations != undefined && conversations.ontem.length > 0 && (
                <>
                    <li className="grouping">Ontem</li>
                    {conversations.ontem.map((conversation:Conversation)=>{
                        return (
                            <li className={id != undefined && id == conversation.id ? "active" :""} key={conversation.id}>
                                <Link to={`/chat/${conversation.id}`} className="conversation-button links"><i className="fa fa-message fa-regular"></i> {conversation.titulo}</Link>
                                <div className="fade"></div>
                                <div className="edit-buttons">
                                    <button><i className="fa fa-edit"></i></button>
                                    <button><i className="fa fa-trash"></i></button>
                                </div>
                            </li>
                        )
                    })}
                </>
            )}
            {conversations != undefined && conversations.seteDias.length > 0 && (
                <>
                    <li className="grouping">7 Dias Atrás</li>
                    {conversations.seteDias.map((conversation:Conversation)=>{
                        return (
                            <li className={id != undefined && id == conversation.id ? "active" :""} key={conversation.id}>
                                <Link to={`/chat/${conversation.id}`} className="conversation-button links"><i className="fa fa-message fa-regular"></i> {conversation.titulo}</Link>
                                <div className="fade"></div>
                                <div className="edit-buttons">
                                    <button><i className="fa fa-edit"></i></button>
                                    <button><i className="fa fa-trash"></i></button>
                                </div>
                            </li>
                        )
                    })}
                </>
            )}
            {conversations != undefined && conversations.trintaDias.length > 0 && (
                <>
                    <li className="grouping">30 Dias Atrás</li>
                    {conversations.trintaDias.map((conversation:Conversation)=>{
                        return (
                            <li className={id != undefined && id == conversation.id ? "active" :""} key={conversation.id}>
                                <Link to={`/chat/${conversation.id}`} className="conversation-button links"><i className="fa fa-message fa-regular"></i> {conversation.titulo}</Link>
                                <div className="fade"></div>
                                <div className="edit-buttons">
                                    <button><i className="fa fa-edit"></i></button>
                                    <button><i className="fa fa-trash"></i></button>
                                </div>
                            </li>
                        )
                    })}
                </>
            )}
            {conversations != undefined && conversations.maisAntigo.length > 0 && (
                <>
                    <li className="grouping">Mais antigo</li>
                    {conversations.maisAntigo.map((conversation:Conversation)=>{
                        return (
                            <li className={id != undefined && id == conversation.id ? "active" :""} key={conversation.id}>
                                <Link to={`/chat/${conversation.id}`} className="conversation-button links"><i className="fa fa-message fa-regular"></i> {conversation.titulo}</Link>
                                <div className="fade"></div>
                                <div className="edit-buttons">
                                    <button><i className="fa fa-edit"></i></button>
                                    <button><i className="fa fa-trash"></i></button>
                                </div>
                            </li>
                        )
                    })}
                </>
            )}
        </>
    )
}


