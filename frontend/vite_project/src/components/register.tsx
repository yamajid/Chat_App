import axiosInstance from './axios';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


function Register({ onRegister }: any) {
  const navigate = useNavigate();
  const [navig, setNavig] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await axiosInstance.post('/api/user/register', {
      'email': formData.email,
      'username': formData.username,
      'password': formData.password
    });
    if (response.status == 201) {
      setNavig(true)
      onRegister();
    }
    console.log('Registration submitted:', formData);
  };
  useEffect(() => {
    if (navig) {

      navigate('/login');

    }
  }, [navig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 font-inter">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-8"
          whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        >
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent"
          >
            Create Account
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email
              </label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-white placeholder-white/60"
                whileFocus={{
                  scale: 1.02,
                  boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.5)"
                }}
                transition={{ type: 'spring', stiffness: 400 }}
              />
            </motion.div>

            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-2">
                Username
              </label>
              <motion.input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-white placeholder-white/60"
                whileFocus={{
                  scale: 1.02,
                  boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.5)"
                }}
                transition={{ type: 'spring', stiffness: 400 }}
              />
            </motion.div>

            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <motion.input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-white placeholder-white/60"
                whileFocus={{
                  scale: 1.02,
                  boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.5)"
                }}
                transition={{ type: 'spring', stiffness: 400 }}
              />
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                type="submit"
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group"
                whileHover={{
                  scale: 1.02,
                  background: "linear-gradient(to right, #8b5cf6, #ec4899, #7c3aed)"
                }}
                whileTap={{
                  scale: 0.98,
                  background: "linear-gradient(to right, #7c3aed, #db2777, #6d28d9)"
                }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <span className="relative z-10">Register</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-4"
            >
              <p className="text-sm text-white/70">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="text-purple-300 hover:text-pink-300 transition-colors duration-200"
                >
                  Login
                </a>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Register;