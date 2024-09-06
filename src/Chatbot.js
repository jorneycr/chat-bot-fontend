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
    const [isOpen, setIsOpen] = useState(true);
    const welcomeSentRef = useRef(false);
    const chatWindowRef = useRef(null);

    //visibilidad del chat
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

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
                    const creationTime = localStorage.getItem('creationToken');
                    const currentTime = new Date().getTime();
    
                    // Si el token no existe o ha pasado más de una hora desde su creación
                    if (!storedToken || !creationTime || (currentTime - parseInt(creationTime)) > 3600000) {
                        const response = await axios.post(apiUrlAuth, { email: apiAuthEmail, password: apiAuthPass });
                        const token = response.data.token;
                        localStorage.setItem('token', token);
                        localStorage.setItem('creationToken', currentTime.toString());
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

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

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

            const botMessage = { user: 'Bot', text: Array.isArray(response.data) ? (
                <div>
                    <p>Estas son algunas preguntas existentes:</p>
                    <ul>
                        {response.data.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                </div>
            ) : response.data.answer };
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
        <section>
            <section className="welcome-message">
                <p>
                    Mini Chatbot<br /><br />
                    Este proyecto es un Mini Chatbot desarrollado en React que permite a los usuarios interactuar con un chatbot a través de una interfaz sencilla. El bot puede responder preguntas y realizar otras funciones básicas. La comunicación entre el frontend (React) y el backend (API) se realiza mediante Axios.                    <br /><br />
                    <strong>Instrucciones:</strong>
                    <br /><br />
                    1. Escribe tu mensaje o pregunta en el campo de texto en la parte inferior.<br /><br />
                    2. Presiona "Enter" o haz clic en el botón "Enviar" para mandar tu mensaje.<br /><br />
                    3. El chatbot responderá automáticamente a tus preguntas.<br /><br />
                    4. Si deseas ver una lista de preguntas disponibles, escribe <code>/preguntas</code>.
                    <br /><br />
                    ¡Comienza a interactuar ahora!
                </p>
                <p></p>
            </section>
    
            {!isOpen && (
                <button className="open-chat-button" onClick={toggleChat}>
                    💬 Chat
                </button>
            )}
    
            {isOpen && (
                <section className="chatbot-container">
                    <header className="chat-header">
                        <h1 className="chatbot-title">Mini Chatbot</h1>
                        <button className="close-button" onClick={toggleChat}>✖</button>
                    </header>
    
                    <section className="chat-window" ref={chatWindowRef}>
                        {messages.map((message, index) => (
                            <article
                                key={index}
                                className={`chat-message ${message.user === 'Bot' ? 'bot-message' : 'user-message'}`}
                            >
                                <p><strong>{message.user}:</strong> {message.text}</p>
                            </article>
                        ))}
                    </section>
    
                    <footer className="input-container">
                        <input
                            className="chat-input"
                            type="text"
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu pregunta..."
                        />
                        <button className="send-button" onClick={sendMessage}>Enviar</button>
                    </footer>
                </section>
            )}
        </section>
    );
};

export default Chatbot;
