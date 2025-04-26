import { motion, sync } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import axiosInstance, { refreshAuthToken } from './axios';
import { useNavigate } from 'react-router-dom';

function Dashboard({ onLogout }: any) {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Rooms[]>([]);
  const [users, setUsers] = useState<Users[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string | null>('');
  const [ready, setReady] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [notifications, setNotification] = useState<any[]>([])
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);


  //   const [formData, setFormData] = useState<string | null>(null);


  interface Message {
    room: number,
    sender: string,
    content: string,
    timestamp: string,
    is_invitation: boolean
  }

  interface Users {
    id: number,
    username: string,
    email: string,
    date_joined: string
  }

  interface Rooms {

    name: string,
    room_type: string,
    participants: Array<{
      id: number,
      username: string,
      email: string,
      date_joined: string,
    }>,
    created_at: string
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
          if (response.status === 401) {
            console.log("accesss not ")
          }
          if (response.data.messages && Array.isArray(response.data.messages)) {
            setMessages(response.data.messages); // Handle nested structure
            console.log("message", messages)
          } else {
            console.error('Unexpected response format:', response.data);
          }
        }
        catch (error: any) {
          if (error.response) {
            if (error.response.status === 401)
              await refreshAuthToken()

          }
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
    const id = localStorage.getItem("user");
    if (!id)
      return;
    if (socket) {
      const message_data = {
        content: message,
        sender: id
      }
      // setMessage()
      socket.send(JSON.stringify(message_data))

    }
    setMessage('');
  }


  const handleCreateNewRoom = async () => {
    setShowUserModal(true)

    const id = localStorage.getItem("user")
    try {

      const response = await axiosInstance.get("http://localhost:8000/api/users/", {
        params: {
          id: id
        }

      });
      if (response.data.users && Array.isArray(response.data.users)) {
        setUsers(response.data.users)
      }
      else {
        console.log("it's not an array")
      }
    }
    catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          await refreshAuthToken()
        }
      }
    }
  }
  useEffect(() => {
    console.log(users); // Logs the updated users state whenever it changes
  }, [users]);

  const handdleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSentMessage()
    }

  }

  const handlePrivate = async () => {

    setActiveChat('private')

    // useEffect(() => {
    const fetchRooms = async () => {
      const client = localStorage.getItem("user")
      try {

        const response = await axiosInstance.get('http://localhost:8000/api/rooms/', {
          params: {
            username: client
          }
        });
        if (response.data.rooms && Array.isArray(response.data.rooms)) {
          setRooms(response.data.rooms);
          console.log("message", response.data.rooms)
        } else {
          console.error('Unexpected response format:', response.data);
        }
      }
      catch (error: any) {
        if (error.response) {
          if (error.response.status === 401) {
            await refreshAuthToken()
            console.log("errrrrrrrrror")
          }
        }
      }
    };
    fetchRooms();
    // }, [activeChat]);
  }

  useEffect(() => {
    if (activeChat == 'private' && socket) {
      socket.close()
    }
  }, [activeChat])

  const handleNotify = async (username: string) => {
    try{

      const response = await axiosInstance.post(`http://localhost:8000/api/invite/?username=${username}`, {
        
        inviter: '',
        invitee: username,
        status_choice: "pending"
        
      });
      if (response.status === 200) {
        console.log("successsssss")
      }
    }
   catch (error: any) {
    if (error.response?.data?.error === "Invitation already sent to this user") {
      // Handle duplicate invitation case
      console.log("Invitation already exists");
      return;
    }
    console.error("Error sending invitation:", error);
  }
  }

  // Fetch unread notifications count


  const handleNotifications = async () => {
    const response = await axiosInstance.get('/api/notify/');
    if (response.status === 200) {
      setNotification(response.data.Invitations)
      setShowNotificationPopup(true);
      console.log(notifications)
    }

  };

  const handleAcceptInvitation = async (invitationId: number) => {
    try {
      const response = await axiosInstance.patch(`/api/accpetorreject/?inviteId=${invitationId}`,
        { status: 'accepted' }
      );
      if (response.status === 200) {
        await handleNotifications();
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
    }
  };

  const handleRejectInvitation = async (invitationId: number) => {
    try {
      const response = await axiosInstance.patch(
        `/api/accpetorreject/?inviteId=${invitationId}`,
        { status: 'rejected' }
      );
      if (response.status === 200) {
        // Refresh notifications
        await handleNotifications();
      }
    } catch (error) {
      console.error("Error rejecting invitation:", error);
    }
  };


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

          {/* Notification Button with Badge */}
          <button
            onClick={handleNotifications}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-100 flex justify-between items-center relative"
          >
            <span>Notifications</span>
            {notifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          <button
            onClick={handleCreateNewRoom}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-100"
          >
            Create New Room
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
                    onKeyDown={handdleKeyPress}
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
          {showNotificationPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  <button
                    onClick={() => setShowNotificationPopup(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No new notifications</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.inviter} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                        <p className="font-medium">{`Invitation from ${notification.inviter}`}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAcceptInvitation(notification.inviter)}
                            className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectInvitation(notification.inviter)}
                            className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Placeholder for when no chat is selected */}
          {activeChat === 'private' && (
            <>
              {/* Private Rooms */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold text-gray-800">Private Messages</h2>
              </div>
              <div className="h-full p-4 overflow-y-auto">
                {rooms.map((room) => (
                  <div key={room.name} className="p-4 bg-gray-100 rounded-lg mb-4">
                    <p className="font-semibold">{room.name}</p>
                    <p className="text-sm text-gray-500">Last message: {room.room_type}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {showUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-lg font-semibold mb-4">Select a User to Create a New Room</h2>
                <div className="space-y-4">
                  {/* Replace this hardcoded list with a dynamic list fetched from the backend */}
                  {users.map((user) => (
                    <div key={user.id} className="flex justify-between items-center">
                      <p className="text-sm">{user.username}</p>
                      <button
                        className="bg-indigo-600 text-white rounded-lg px-3 py-1 hover:bg-indigo-700"
                        onClick={() => handleNotify(user.username)} // Replace with actual invite logic

                      >
                        Notify
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-4 w-full bg-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-400"
                  onClick={() => setShowUserModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
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