import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './index.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const welcomeSentRef = useRef(false);

  // Agregar mensaje de bienvenida cuando el componente se monta
  useEffect(() => {
    if (!welcomeSentRef.current) {
      setMessages(prevMessages => [
        ...prevMessages, 
        { user: 'Bot', text: 'Hola! Soy el bot. Escribe /preguntas ver las preguntas disponibles' }
      ]);
      welcomeSentRef.current = true;
    }
  }, []);

  const sendMessage = async () => {
    const trimmedInput = userInput.trim();

    if (!trimmedInput) return;

    const userMessage = { user: 'Usuario', text: trimmedInput };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', { question: trimmedInput });
      
      const botMessage = { user: 'Bot', text: Array.isArray(response.data) ? response.data.join(',\n') : response.data.answer };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
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
      <div className="chat-window">
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
          onKeyDown={handleKeyDown} // Capturar evento de tecla
          placeholder="Escribe tu pregunta..."
        />
        <button className="send-button" onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
};

export default Chatbot;
