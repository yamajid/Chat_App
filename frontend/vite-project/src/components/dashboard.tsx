import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import axiosInstance from './axios';
import { useNavigate } from 'react-router-dom';

function Dashboard({ onLogout }: any) {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string | null>('');
  const [ready, setReady] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  //   const [formData, setFormData] = useState<string | null>(null);


  interface Message {
    room: number,
    sender: string,
    content: string,
    timestamp: string,
    is_invitation: boolean
  }

  // Check auth status
  useEffect(() => {
    const token = localStorage.getItem('user');
    if (!token) navigate('/login');
  }, [navigate]);
  const handleLogout = async () => {
    const response = await axiosInstance.post('http://localhost:8000/api/user/logout');
    if (response.status === 200) {
      localStorage.removeItem('user');
      onLogout();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target;
    setMessage(value.value);
  };


    useEffect(() => {
      const fetchRooms = async () => {
        const client = localStorage.getItem("user")
        const response = await axiosInstance.get('http://localhost:8000/api/rooms/', {
          params: {
            username: client
          }
        });
        setUsers(response.data);
      };
        fetchRooms();
    }, [activeChat]);

  // Fetch messages (replace with your actual API call)
  useEffect(() => {
    if (activeChat === 'general') {
      const fetchMessages = async () => {
        try {

          const response = await axiosInstance.get('http://localhost:8000/api/general/', {
            params: {
              room_name: 'general'
            }
          });
          if (response.data.messages && Array.isArray(response.data.messages)) {
            setMessages(response.data.messages); // Handle nested structure
            console.log("message", messages)
          } else {
            console.error('Unexpected response format:', response.data);
          }
        }
        catch (error) {
          console.log(error)
        }

      };
      fetchMessages();
    }
  }, [activeChat, ready]);
  


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handelJoinGene = () => {
    setActiveChat('general');
    const ws = new WebSocket('ws://localhost:8000/ws/chat/')

    ws.onopen = () => {
      console.log('WebSocket connection established')
    }
    ws.onclose = () => {
      console.log('WebSocket connection closed')
    }
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setReady((prev) => !prev)
      console.log(data);
    }
    setSocket(ws)

  }


  const handleSentMessage = () => {
    if (message?.trim() === '') return
    const user = localStorage.getItem("user");
    if (!user)
      return;
    if (socket) {
      const message_data = {
        content: message,
        sender: user
      }
      // setMessage()
      socket.send(JSON.stringify(message_data))

    }
    setMessage('');
  }


  const handlePrivate = async () => {

    setActiveChat('private')
    // const user = localStorage.getItem("user");
    // const response = await axiosInstance.get('http://localhost:8000/api/createroom/', {
    //   params: {
    //     username: user
    //   }
    // });
    // console.log(response)
  }

  useEffect(() => {
    if (activeChat == 'private' && socket) {
      socket.close()
    }
  }, [activeChat])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Sidebar */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg"
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-indigo-600">ChatApp</h1>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => handelJoinGene()}
            className={`w-full text-left p-3 rounded-lg ${activeChat === 'general' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'hover:bg-gray-100'}`}
          >
            General Chat
          </button>
          <button
            onClick={handlePrivate}
            className={`w-full text-left p-3 rounded-lg ${activeChat === 'private' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'hover:bg-gray-100'}`}
          >
            Private Messages
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-100 text-red-600"
          >
            Logout
          </button>
        </nav>
      </motion.div>

      {/* Main Content Area */}
      <div className="ml-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl h-[calc(100vh-4rem)] overflow-hidden"
        >
          {activeChat === 'general' && (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold text-gray-800">General Chat</h2>
              </div>

              {/* Messages Area */}
              <div className="h-[calc(100%-130px)] p-4 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className={`flex m-4  ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${message.sender === 'me' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                      <p>{message.content}</p>
                      <p className="text-xs mt-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>


              {/* Message Input */}
              <motion.div
                className="p-4 border-t border-gray-200"
                whileHover={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={message as string}
                    onChange={handleChange}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={handleSentMessage}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            </>
          )}

          {/* Placeholder for when no chat is selected */}
          {activeChat === 'private' && (
            <>
              {/* Private Rooms */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold text-gray-800">Private Messages</h2>
              </div>
              <div className="h-full p-4 overflow-y-auto">
                {users.map((room) => (
                  <div key={room.id} className="p-4 bg-gray-100 rounded-lg mb-4">
                    <p className="font-semibold">{room.name}</p>
                    <p className="text-sm text-gray-500">Last message: {room.last_message}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {!activeChat && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <h2 className="text-lg font-semibold mb-4">Welcome to ChatApp!</h2>
              <p className="mb-8 text-center">Select a chat to start messaging or explore our community.</p>
              <motion.button
                className="px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700"
                whileHover={{ scale: 1.05 }}
                onClick={handelJoinGene}
              >
                Join the Conversation
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;