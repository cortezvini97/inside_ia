import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

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
    const { id } = useParams();
    const [editingId, setEditingId] = useState<string | null>(null); // Estado para rastrear edição
    const [editedTitle, setEditedTitle] = useState<string>(""); // Estado para o título editado

    const deleteConversation = (id: string) => {
        var route = `/chat/delete/${id}`;
        window.location.href = route;
    };

    const startEditing = (conversation: Conversation) => {
        setEditingId(conversation.id);
        setEditedTitle(conversation.titulo); // Preencha o campo com o título existente
    };

    const saveTitle = (id: string) => {
        // Aqui você pode salvar o título editado via API ou atualizar no estado pai
        console.log(`Salvar título "${editedTitle}" para conversa ${id}`);
        if (editedTitle != "") {
            setEditingId(null); // Sair do modo de edição

            const config = {
                method: 'POST',
                maxBodyLength: Infinity,
                url:`https://localhost:8000/chat/titleedit/${id}`,
                headers: { 
                    'Content-Type': 'application/json' 
                },
                data: JSON.stringify({titulo: editedTitle})
            }

            axios.request(config).then((res)=>{
                window.location.reload();
            }).catch(err=>console.error(err))
        }
    };

    const submitUpdateTitle = (e:any, conversation_id:string)=>{
        e.preventDefault()
        saveTitle(conversation_id)
    }

    return (
        <>
            {conversations &&
                Object.entries({
                    hoje: "Hoje",
                    ontem: "Ontem",
                    seteDias: "7 Dias Atrás",
                    trintaDias: "30 Dias Atrás",
                    maisAntigo: "Mais Antigo",
                }).map(([key, label]) => {
                    const category = conversations[key as keyof CategorizedConversations];
                    if (category.length === 0) return null;

                    return (
                        <React.Fragment key={key}>
                            <li className="grouping">{label}</li>
                            {category.map((conversation: Conversation) => {
                                const isEditing = editingId === conversation.id;

                                return (
                                    <li
                                        className={id !== undefined && id === conversation.id ? "active" : ""}
                                        key={conversation.id}
                                    >
                                        {isEditing ? (
                                            <div style={{overflow:"hidden"}}>
                                                <form onSubmit={(e:any)=>submitUpdateTitle(e, conversation.id)}>
                                                    <input
                                                        className="input-edit-title"
                                                        value={editedTitle}
                                                        onChange={(e) => setEditedTitle(e.target.value)}
                                                    />
                                                </form>
                                            </div>
                                        ) : (
                                            <>
                                                <Link
                                                    to={`/chat/${conversation.id}`}
                                                    className="conversation-button links"
                                                >
                                                    <i className="fa fa-message fa-regular"></i> {conversation.titulo}
                                                </Link>
                                                <div className="fade"></div>
                                                <div className="edit-buttons">
                                                    <button onClick={() => startEditing(conversation)}>
                                                        <i className="fa fa-edit"></i>
                                                    </button>
                                                    <button onClick={() => deleteConversation(conversation.id)}>
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </li>
                                );
                            })}
                        </React.Fragment>
                    );
                })}
        </>
    );
};

