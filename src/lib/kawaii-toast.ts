import toast from 'react-hot-toast'

// Kawaii anime-style toast notifications with cute emojis and messages

export const kawaiiToast = {
  // Success notifications with sparkles and cute emojis
  success: (message: string, isIndonesian = false) => {
    const sparkles = ['✨', '🌟', '⭐', '💫', '🎀', '🌸', '💖', '🦄'][Math.floor(Math.random() * 8)]
    const cuteMessage = `${sparkles} ${message} ${sparkles}`
    
    return toast.success(cuteMessage, {
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        borderRadius: '25px',
        border: '3px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(102, 126, 234, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        fontSize: '15px',
        fontWeight: '600',
        padding: '20px 24px',
        transform: 'scale(1.02)',
      },
      duration: 6000,
      icon: '🎉',
    })
  },

  // Error notifications with cute apologetic style
  error: (message: string, isIndonesian = false) => {
    const sadEmojis = ['😢', '🥺', '😿', '💔', '😰', '😭'][Math.floor(Math.random() * 6)]
    const apology = isIndonesian ? 'Gomen...' : 'Oops...'
    const cuteMessage = `${sadEmojis} ${apology} ${message}`
    
    return toast.error(cuteMessage, {
      style: {
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        color: '#721c24',
        borderRadius: '25px',
        border: '3px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 25px 50px -12px rgba(255, 154, 158, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        fontSize: '15px',
        fontWeight: '600',
        padding: '20px 24px',
        transform: 'scale(1.02)',
      },
      duration: 6000,
      icon: '💔',
    })
  },

  // Loading notifications with cute waiting messages
  loading: (message: string, isIndonesian = false) => {
    const waitEmojis = ['⏳', '🔄', '💭', '🌀', '⌛', '🔮'][Math.floor(Math.random() * 6)]
    const waitText = isIndonesian ? 'Tunggu sebentar ya~' : 'Just a moment~'
    const cuteMessage = `${waitEmojis} ${waitText} ${message}`
    
    return toast.loading(cuteMessage, {
      style: {
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        color: '#1f2937',
        borderRadius: '25px',
        border: '3px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 25px 50px -12px rgba(168, 237, 234, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        fontSize: '15px',
        fontWeight: '600',
        padding: '20px 24px',
        transform: 'scale(1.02)',
      },
      icon: '🌸',
    })
  },

  // Special anime-style notifications
  anime: {
    // Welcome message
    welcome: (name?: string, isIndonesian = false) => {
      const welcomeText = isIndonesian 
        ? `Ohayo gozaimasu${name ? `, ${name}` : ''}! 🌸 Selamat datang di dapur ajaib! ✨`
        : `Welcome back${name ? `, ${name}` : ''}-chan! 🌸 Ready to cook something magical? ✨`
      
      return kawaiiToast.success(welcomeText, isIndonesian)
    },

    // Recipe success
    recipeSuccess: (isIndonesian = false) => {
      const messages = isIndonesian 
        ? ['Resep magis telah lahir!', 'Sugoi! Resep siap!', 'Yatta! Resep sempurna!']
        : ['Magical recipe created!', 'Sugoi! Recipe is ready!', 'Yatta! Perfect recipe!']
      
      const message = messages[Math.floor(Math.random() * messages.length)]
      return kawaiiToast.success(message, isIndonesian)
    },

    // Save success
    saveSuccess: (isIndonesian = false) => {
      const messages = isIndonesian 
        ? ['Tersimpan dengan selamat!', 'Data aman di hati~', 'Berhasil disimpan desu!']
        : ['Saved safely!', 'Data secured in my heart~', 'Successfully saved desu!']
      
      const message = messages[Math.floor(Math.random() * messages.length)]
      return kawaiiToast.success(message, isIndonesian)
    },

    // Delete/clear success
    deleteSuccess: (isIndonesian = false) => {
      const messages = isIndonesian 
        ? ['Sayonara data lama!', 'Berhasil dibersihkan!', 'Data telah pergi dengan damai~']
        : ['Sayonara old data!', 'Successfully cleared!', 'Data left peacefully~']
      
      const message = messages[Math.floor(Math.random() * messages.length)]
      return kawaiiToast.success(message, isIndonesian)
    },

    // Connection success
    connectionSuccess: (isIndonesian = false) => {
      const messages = isIndonesian 
        ? ['Koneksi AI berhasil!', 'AI-chan siap membantu!', 'Terhubung dengan dunia ajaib!']
        : ['AI connection successful!', 'AI-chan ready to help!', 'Connected to magical world!']
      
      const message = messages[Math.floor(Math.random() * messages.length)]
      return kawaiiToast.success(message, isIndonesian)
    },

    // Language change
    languageChange: (language: 'en' | 'id') => {
      const message = language === 'en' 
        ? 'Language switched to English desu!' 
        : 'Bahasa diubah ke Indonesia desu!'
      
      return kawaiiToast.success(message, language === 'id')
    },

    // Errors with cute apologies
    aiError: (isIndonesian = false) => {
      const messages = isIndonesian 
        ? ['AI-chan sedang istirahat...', 'Maaf, ada gangguan di dunia digital...', 'AI-chan butuh waktu sebentar...']
        : ['AI-chan is taking a break...', 'Sorry, disturbance in digital world...', 'AI-chan needs a moment...']
      
      const message = messages[Math.floor(Math.random() * messages.length)]
      return kawaiiToast.error(message, isIndonesian)
    },

    // Network error
    networkError: (isIndonesian = false) => {
      const messages = isIndonesian 
        ? ['Koneksi sedang main petak umpet...', 'Internet-kun hilang sebentar...', 'Jaringan sedang malu-malu...']
        : ['Connection is playing hide and seek...', 'Internet-kun disappeared for a moment...', 'Network is being shy...']
      
      const message = messages[Math.floor(Math.random() * messages.length)]
      return kawaiiToast.error(message, isIndonesian)
    },

    // Form validation error
    validationError: (isIndonesian = false) => {
      const messages = isIndonesian 
        ? ['Ada yang terlewat nih~', 'Form-chan butuh dilengkapi dulu~', 'Isi yang lengkap ya~']
        : ['Something was missed~', 'Form-chan needs to be completed first~', 'Please fill completely~']
      
      const message = messages[Math.floor(Math.random() * messages.length)]
      return kawaiiToast.error(message, isIndonesian)
    }
  }
}

// Export individual functions for convenience
export const {
  success: kawaiiSuccess,
  error: kawaiiError,
  loading: kawaiiLoading,
  anime: animeToast
} = kawaiiToast 