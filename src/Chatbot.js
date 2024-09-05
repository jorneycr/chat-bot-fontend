import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './index.css';

const apiUrlAuth = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL_LOGIN_PROD : process.env.REACT_APP_API_URL_LOGIN_DEV;
const apiUrlChat = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL_CHAT_PROD : process.env.REACT_APP_API_URL_CHAT_DEV;
const apiAuthEmail = process.env.REACT_APP_EMAIL;
const apiAuthPass = process.env.REACT_APP_PASSWORD;

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const welcomeSentRef = useRef(false);
    const chatWindowRef = useRef(null);

    // Agregar mensaje de bienvenida cuando el componente se monta y manejo de token
    useEffect(() => {
        const fetchToken = async () => {

            if (!welcomeSentRef.current) {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { user: 'Bot', text: 'Hola! Soy el bot. Escribe /preguntas para ver las preguntas disponibles' }
                ]);
                welcomeSentRef.current = true;
                try {
                    const storedToken = localStorage.getItem('token');
                    if (!storedToken) {
                                                
                        const response = await axios.post(apiUrlAuth, { email: apiAuthEmail, password: apiAuthPass });
                        const token = response.data.token;
                        localStorage.setItem('token', token);
                        console.log('Token nuevo ' + token);
                    } else {
                        console.log('Token almacenado ' + storedToken);
                    }
                    
                } catch (error) {
                    console.error('Error al obtener el token:', error);
                }
            }
        };

        fetchToken();
    }, []);

    // Desplazar hacia abajo el chat cuando se agregue un nuevo mensaje
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    // Envio de mensaje, elimina espacios, guarda los mensajes existentes y agrega nuevo en la UI, envio de request con el token obtenido
    const sendMessage = async () => {
        const trimmedInput = userInput.trim();

        if (!trimmedInput) return;

        const userMessage = { user: 'Usuario', text: trimmedInput };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.post(apiUrlChat, { question: trimmedInput }, config);

            const botMessage = { user: 'Bot', text: Array.isArray(response.data) ? response.data.join(',\n') : response.data.answer };
            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            const errorMessage = { user: 'Bot', text: 'Lo siento, hubo un error al procesar tu solicitud.' };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        }

        setUserInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="chatbot-container">
            <h1 className="chatbot-title">Mini Chatbot</h1>
            <div className="chat-window" ref={chatWindowRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chat-message ${message.user === 'Bot' ? 'bot-message' : 'user-message'}`}
                    >
                        <p><strong>{message.user}:</strong> {message.text}</p>
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    className="chat-input"
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu pregunta..."
                />
                <button className="send-button" onClick={sendMessage}>Enviar</button>
            </div>
        </div>
    );
};

export default Chatbot;
