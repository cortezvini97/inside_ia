from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from tools import getTools

class InsideIA:
    """Class InsideIA"""
    def __init__(self, model, userPrompt,chat_id, messages=[], file=None):
        self.model = model
        self.chat_id = chat_id
        self.messages = messages
        self.userPrompt = userPrompt
        self.file = file
    

    def __get_messages(self):
        processed_messages = []
        for msg in self.messages:
            if msg.get("type") == "Humman":  # Se for uma mensagem humana
                processed_message = HumanMessage(content=msg["msg"])
            elif msg.get("type") == "IA":  # Se for uma mensagem de IA
                processed_message = AIMessage(content=msg["msg"])
            else:
                continue  # Ignora se o tipo não for "human" ou "ai"
            processed_messages.append(processed_message)
        return processed_messages



    def genResponse(self):
        tools = getTools()
        llm = ChatGoogleGenerativeAI(model=self.model, temperature=1)
        memory = InMemoryChatMessageHistory(session_id=self.chat_id)
        messages = self.__get_messages()
        memory.add_messages(messages=messages)
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system","""
                    Seu nome é Inside IA . Você é um assistente virtual que pode ajudar com diversas tarefas de acordo com suas ferramentas.
                """),
                # First put the history
                ("placeholder", "{chat_history}"),
                # Then the new input
                ("human", "{input}"),
                # Finally the scratchpad
                ("placeholder", "{agent_scratchpad}"),
            ]
        )
        agent = create_tool_calling_agent(llm, tools, prompt)
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
        agent_with_chat_history = RunnableWithMessageHistory(
            agent_executor,
            # This is needed because in most real world scenarios, a session id is needed
            # It isn't really used here because we are using a simple in memory ChatMessageHistory
            lambda session_id: memory,
            input_messages_key="input",
            history_messages_key="chat_history",
        )
        config = {"configurable": {"session_id": self.chat_id}}

        if self.file !=None:
                print("este")
                file = self.file.split(";")
                result =  agent_with_chat_history.invoke({
                    #"input": f"{self.userPrompt}/{file[1]} mime_type:{file[0]} conversation_id:{self.chat_id}",
                    "input": f"prompt: {self.userPrompt}/file_name:{file[1]}/mime_type:{file[0]}/conversation_id:{self.chat_id}"
                }, config)

                
                print(result)

                result_json = {
                    "input":self.userPrompt,
                    "file":self.file,
                    "output":result["output"],
                }
                return result_json
        else:
            result =  agent_with_chat_history.invoke({
                "input": f"{self.userPrompt}",
            }, config)

            print(result)
        
            result_json = {
                "input":self.userPrompt,
                "file":None,
                "output":result["output"],
            }


            return result_json