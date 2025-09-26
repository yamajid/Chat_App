import React from 'react';
import { motion } from 'framer-motion';
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [privSocket, setPrivSocket] = useState<WebSocket | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [notifications, setNotification] = useState<any[]>([])
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateError, setUpdateError] = useState('');


  interface Message {
    room: string,
    sender: string,
    content: string,
    timestamp: string,
    is_invitation: boolean
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

  interface Users {
    username: string,
  }


  // Check auth status
  useEffect(() => {
    const id = localStorage.getItem('user');
    if (!id) navigate('/login');
  }, [navigate]);
  const handleLogout = async () => {
    const response = await axiosInstance.post('/api/user/logout');
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
    if (activeChat === 'general') {
      const fetchMessages = async () => {
        try {

          const response = await axiosInstance.get('/api/general/', {
            params: {
              room_name: 'general'
            }
          });
          if (response.status === 401) {
            await refreshAuthToken();
          }
          if (response.data.messages && Array.isArray(response.data.messages)) {
            setMessages(response.data.messages); 
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
  }, [activeChat]);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handelJoinGene = () => {
    setActiveChat('general');
    
    // Close existing socket if it exists
    if (socket?.readyState === WebSocket.OPEN) {
      socket.close();
    }
    
    const ws = new WebSocket('ws://localhost:8000/ws/chat/')

    ws.onopen = () => {
      setSocket(ws);
    };
    ws.onclose = () => {
      setSocket(null);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMessages((prev: Message[]) => [...prev, data.message])
    }
  }


  const handleSentMessage = () => {
    if (message?.trim() === '') return
    const username = localStorage.getItem("username");
    const id = localStorage.getItem("user");
    if (!username || !id)
      return;
    const messageData = {
      content: message,
      sender: username,
      id : id
    }
    
    if (activeChat === 'general' && socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(messageData));
    }
    else if (activeChat?.startsWith('private') && privSocket?.readyState === WebSocket.OPEN) {
      privSocket.send(JSON.stringify(messageData));
    }

    setMessage('');
  }

  const handleCreateNewRoom = async () => {
    setShowUserModal(true)

    const id = localStorage.getItem("user")
    try {

      const response = await axiosInstance.get("/api/users/", {
        params: {
          id: id
        }

      });
      if (response.data.users && Array.isArray(response.data.users)) {
        setUsers(response.data.users)
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

  }, [users, messages, notifications]);

  const handdleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSentMessage()
    }

  }

  const handlePrivate = async () => {

    setActiveChat('private')
    setMessages([])
    const fetchRooms = async () => {
      const client = localStorage.getItem("user")
      try {

        const response = await axiosInstance.get('/api/rooms/', {
          params: {
            username: client
          }
        });
        if (response.data.rooms && Array.isArray(response.data.rooms)) {
          setRooms(response.data.rooms);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      }
      catch (error: any) {
        if (error.response) {
          if (error.response.status === 401) {
            await refreshAuthToken()
          }
        }
      }
    };
    fetchRooms();
  }

  useEffect(() => {
    if (activeChat !== 'general' && socket?.readyState === WebSocket.OPEN) {
      socket.close()
      setSocket(null)
    }
    else if (activeChat === 'general' && privSocket?.readyState === WebSocket.OPEN) {
      privSocket.close()
      setPrivSocket(null);
    }
  }, [activeChat])

  const handleNotify = async (username: string) => {
    try {

      const response = await axiosInstance.post(`/api/invite/?username=${username}`, {

        inviter: '',
        invitee: username,
        status_choice: "pending"

      });
      if (response.status === 200) {
      }
    }
    catch (error: any) {
      if (error.response?.data?.error === "Invitation already sent to this user") {
        // Handle duplicate invitation case
        // Invitation already exists
        return;
      }
      console.error("Error sending invitation:", error);
    }
  }

  // Fetch unread notifications count
  useEffect(() => {
    const fetchNoftification =  async () => {
      const response = await axiosInstance.get('/api/notify/');
      if (response.status === 200) {
        setNotification(response.data.Invitations)
      }
    }
    fetchNoftification();
    const interval = setInterval(fetchNoftification, 5000)
    return () => clearInterval(interval)

      
  }, [])


  const handleNotifications = async () => {
    setShowNotificationPopup(true);

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

  const handlePrivateConnection = async (room_name: string) => {
    if (privSocket?.OPEN) {
      privSocket.close()
      setPrivSocket(null)
    }

    const ws = new WebSocket(`http://localhost:8000/ws/chat/private/${room_name}/`)

    ws.onopen = () => {
      setPrivSocket(ws)
      // WebSocket connection established
    }
    ws.onclose = () => {
      setPrivSocket(null)
      // WebSocket connection closed
    }
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMessages((prev: Message[]) => [...prev, data.message])
      // Removed setReady trigger to prevent unnecessary API refetch
    }
  }


  const fetchPrivateRoomMessages = async (username: string) => {
    try {
      const response = await axiosInstance.get(`/api/room/?username=${username}`);

      if (response.data.room && response.data.messages) {
        const room_name = response.data.room.name;
        setMessages(response.data.messages);
        await handlePrivateConnection(room_name)
        return response.data.room;
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        await refreshAuthToken();
      }
      console.error('Error fetching private room:', error);
    }
  };


  const handleUpdateInfo = async (e: any) => {
    e.preventDefault();
    try {
      if (formData.newPassword !== formData.confirmPassword) {
        setUpdateError("New passwords don't match");
        return;
      }

      const response = await axiosInstance.post('/api/user/update', {
        info : {
          username: formData.username,
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        }
      });

      if (response.status === 200) {
        setShowUpdateForm(false);
      }
    } catch (error: any) {
      setUpdateError(error.response?.data?.message || "Failed to update profile");
    }

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      {/* Navigation Sidebar */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-white to-purple-50 shadow-2xl shadow-purple-500/20 border-r border-purple-200/50"
      >
        <div className="p-6 border-b border-purple-200/30">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">ChatApp</h1>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => handelJoinGene()}
            className={`w-full text-left p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${activeChat === 'general' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-medium border border-purple-300/50 shadow-lg shadow-purple-200/50' : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-700 hover:text-purple-600'}`}
          >
            General Chat
          </button>
          <button
            onClick={handlePrivate}
            className={`w-full text-left p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${activeChat === 'private' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-medium border border-purple-300/50 shadow-lg shadow-purple-200/50' : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-700 hover:text-purple-600'}`}
          >
            Private Messages
          </button>

          {/* Notification Button with Badge */}
          <button
            onClick={handleNotifications}
            className="w-full text-left p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-700 hover:text-purple-600 hover:shadow-lg flex justify-between items-center relative"
          >
            <span>Notifications</span>
            {notifications.length > 0 && (
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-pink-300/50">
                {notifications.length}
              </span>
            )}
          </button>

          <button
            onClick={handleCreateNewRoom}
            className="w-full text-left p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-700 hover:text-purple-600 hover:shadow-lg"
          >
            Create New Room
          </button>
          <button className="w-full text-left p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-700 hover:text-purple-600 hover:shadow-lg"
            onClick={() => setShowUpdateForm(true)}
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50 text-rose-600 hover:text-red-600 hover:shadow-lg"
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
          className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-2xl shadow-purple-200/30 border border-purple-100/50 h-[calc(100vh-4rem)] overflow-hidden"
        >

          {showUpdateForm && (
            <motion.div
              className="fixed inset-0 bg-purple-900/20 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-white to-purple-50/50 rounded-xl p-6 w-96 shadow-2xl shadow-purple-300/30 border border-purple-200/50"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Update Profile</h2>
                  <button
                    onClick={() => setShowUpdateForm(false)}
                    className="text-gray-500 hover:text-purple-600 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {updateError && (
                  <motion.div
                    className="mb-4 p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-lg text-sm shadow-lg shadow-red-100/50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {updateError}
                  </motion.div>
                )}

                <form onSubmit={handleUpdateInfo}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">New Username</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm"
                        placeholder="Enter new username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm"
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <motion.button
                      type="button"
                      onClick={() => setShowUpdateForm(false)}
                      className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 rounded-lg text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-300/50 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Update
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
          {activeChat === 'general' && (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-purple-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">General Chat</h2>
              </div>

              {/* Messages Area */}
              <div className="h-[calc(100%-130px)] p-4 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className={`flex m-4 ${message.sender === localStorage.getItem('username') ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 ${message.sender === localStorage.getItem('username') ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-300/50' : 'bg-gradient-to-r from-white to-purple-50 text-gray-800 shadow-purple-200/30 border border-purple-100'}`}>
                      {/* Show username in general chat for group context */}
                      <p className="font-medium text-sm mb-1 opacity-90">{message.sender}</p>
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>


              {/* Message Input */}
              <motion.div
                className="p-4 border-t border-purple-200/50 bg-gradient-to-r from-white to-purple-50"
                whileHover={{ boxShadow: '0 4px 20px rgba(147, 51, 234, 0.1)' }}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={message as string}
                    onChange={handleChange}
                    placeholder="Type your message..."
                    onKeyDown={handdleKeyPress}
                    className="flex-1 px-4 py-2 border border-purple-200 bg-gradient-to-r from-white to-purple-50 rounded-full focus:ring-2 focus:ring-purple-400 focus:border-purple-400 shadow-sm hover:shadow-md transition-all duration-200"
                  />
                  <button className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:scale-105 transform transition-all duration-200"
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
          { showNotificationPopup && (
            <motion.div
              className="fixed inset-0 bg-purple-900/20 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto shadow-2xl border border-purple-200"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">Notifications</h2>
                  <button
                    onClick={() => setShowNotificationPopup(false)}
                    className="text-purple-500 hover:text-pink-600 hover:scale-110 transform transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-purple-500 text-center py-4">No new notifications</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.inviter} className="p-3 border border-purple-200/50 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-200 shadow-sm hover:shadow-md">
                        <p className="font-medium text-purple-800">{`Invitation from ${notification.inviter}`}</p>
                        <p className="text-sm text-purple-600">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAcceptInvitation(notification.inviter)}
                            className="text-xs bg-gradient-to-r from-green-400 to-emerald-400 text-white px-3 py-1 rounded-lg shadow-lg hover:from-green-500 hover:to-emerald-500 hover:scale-105 transform transition-all duration-200"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectInvitation(notification.inviter)}
                            className="text-xs bg-gradient-to-r from-pink-400 to-rose-400 text-white px-3 py-1 rounded-lg shadow-lg hover:from-pink-500 hover:to-rose-500 hover:scale-105 transform transition-all duration-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Placeholder for when no chat is selected */}
          {activeChat?.startsWith('private') && (
            <>
              {/* Private Rooms Header */}
              <div className="p-4 border-b border-purple-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                  {activeChat === 'private' ? 'Private Messages' : `Private Chat: ${activeChat.replace('private-', '')}`}
                </h2>
              </div>

              {/* Two-column layout: Room list and Chat area */}
              <div className="flex h-[calc(100%-130px)]">
                {/* Room list sidebar */}
                <div className="w-1/4 border-r border-purple-200/50 overflow-y-auto bg-gradient-to-b from-purple-50 to-white">
                  <div className="p-4 border-b border-purple-200/50 bg-gradient-to-r from-white to-purple-50">
                    <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Private Chats</h3>
                  </div>
                  {rooms.length === 0 ? (
                    <div className="p-4 text-center text-purple-500">
                      <p className="text-sm">No private chats yet</p>
                      <p className="text-xs mt-1 text-purple-400">Create a new room to start chatting</p>
                    </div>
                  ) : (
                    rooms.map((room) => (
                      <div
                        key={room.name}
                        className={`p-4 hover:bg-gradient-to-r hover:from-white hover:to-purple-50 cursor-pointer border-b border-purple-200/50 transition-all duration-200 hover:scale-105 transform ${
                          activeChat === `private-${room.name}` ? 'bg-gradient-to-r from-white to-purple-50 border-l-4 border-l-purple-500 shadow-lg' : ''
                        }`}
                        onClick={() => {
                          // Fetch messages for this room when clicked
                          fetchPrivateRoomMessages(room.name);
                          setActiveChat(`private-${room.name}`);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-purple-600 font-semibold">
                              {room.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-purple-800 truncate">{room.name}</p>
                            <p className="text-xs text-purple-500">Private conversation</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat area */}
                <div className="w-3/4 flex flex-col bg-gradient-to-br from-white to-purple-50">
                  {/* Messages Area */}
                  <div className="h-[calc(100%-80px)] p-4 overflow-y-auto">
                    {activeChat === 'private' ? (
                      // Show instruction when no specific room is selected
                      <div className="flex flex-col items-center justify-center h-full text-purple-500">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <h3 className="text-lg font-medium bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-2">Select a conversation</h3>
                          <p className="text-sm text-purple-500 max-w-sm">
                            Choose a private chat from the list to start messaging, or create a new room to begin a conversation.
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div key={index} className={`flex m-4 ${message.sender === localStorage.getItem('username') ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs p-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 ${message.sender === localStorage.getItem('username') ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-300/50' : 'bg-gradient-to-r from-white to-purple-50 text-gray-800 shadow-purple-200/30 border border-purple-100'}`}>
                            {/* No username display in private messages - it's just between two users */}
                            <p>{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input - Only show when a specific room is selected */}
                  {activeChat !== 'private' && activeChat?.startsWith('private-') && (
                    <motion.div
                      className="p-4 border-t border-purple-200/50 bg-gradient-to-r from-white to-purple-50"
                      whileHover={{ boxShadow: '0 4px 20px rgba(147, 51, 234, 0.1)' }}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={message as string}
                          onChange={handleChange}
                          placeholder="Type your message..."
                          onKeyDown={handdleKeyPress}
                          className="flex-1 px-4 py-2 border border-purple-200 bg-gradient-to-r from-white to-purple-50 rounded-full focus:ring-2 focus:ring-purple-400 focus:border-purple-400 shadow-sm hover:shadow-md transition-all duration-200"
                        />
                        <button
                          className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:scale-105 transform transition-all duration-200"
                          onClick={handleSentMessage}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </>
          )}
          {showUserModal && (
            <motion.div
              className="fixed inset-0 bg-purple-900/20 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 w-96 shadow-2xl border border-purple-200"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">Select a User to Create a New Room</h2>
                <div className="space-y-4">
                  {/* Replace this hardcoded list with a dynamic list fetched from the backend */}
                  {users.map((user) => (
                    <div key={user.username} className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                      <p className="text-sm text-purple-800">{user.username}</p>
                      <button
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg px-3 py-1 hover:from-purple-600 hover:to-pink-600 hover:scale-105 transform transition-all duration-200 shadow-lg"
                        onClick={() => handleNotify(user.username)}
                      >
                        Notify
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-4 w-full bg-gradient-to-r from-purple-200 to-pink-200 text-purple-700 rounded-lg px-4 py-2 hover:from-purple-300 hover:to-pink-300 transition-all duration-200"
                  onClick={() => setShowUserModal(false)}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}

          {!activeChat && (
            <div className="flex flex-col items-center justify-center h-full text-purple-500">
              <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">Welcome to ChatApp!</h2>
              <p className="mb-8 text-center text-purple-600">Select a chat to start messaging or explore our community.</p>
              <button
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 hover:scale-105 transform transition-all duration-200"
                onClick={handelJoinGene}
              >
                Join the Conversation
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;