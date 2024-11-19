import React from "react";
import { createRoot } from "react-dom/client"
import { BrowserRouter, createBrowserRouter, RouterProvider } from "react-router-dom"
import App from  "./app.tsx"
import AppMsg from './appMsg.tsx'


function init(){
    const container = document.querySelector("#content")
 
    const router = createBrowserRouter(
        [
            {
                path: '/',
                element: <App />
            },
            {
                path: "/chat/:id",
                element: <AppMsg />
            }
        ],
        {
            future: {
                v7_startTransition: false,
                v7_relativeSplatPath: false,
                v7_fetcherPersist: false,
                v7_normalizeFormMethod: false,
                v7_partialHydration: false,
                v7_skipActionErrorRevalidation: false,
            }
        }
    )
    
    const root = createRoot(container)
    root.render(
        <RouterProvider router={router} />
    )

}

export default init