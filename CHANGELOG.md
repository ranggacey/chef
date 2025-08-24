# Changelog

All notable changes to Chef AI will be documented in this file.

## [2.0.0] - 2024-12-26

### 🚀 Major Changes
- **API Migration**: Migrated from Google Gemini to Lunos.tech API
- **CORS Fix**: Implemented API proxy system to resolve CORS issues
- **Security Enhancement**: Moved API keys to server-side only

### ✨ New Features
- **Bilingual Support**: Auto-detect Indonesian/English language
- **Kawaii UI**: Anime-themed toast notifications and modals
- **Enhanced Security**: Strong password validation (8+ chars with special requirements)
- **Responsive Design**: Improved mobile experience with expandable search
- **API Proxy**: Development and production API proxy for security

### 🔧 Technical Improvements
- **Environment Setup**: Simplified to use only `.env.local`
- **Development Server**: Custom Express server for API proxy
- **Security Headers**: Added comprehensive security headers for Vercel
- **Error Handling**: Improved error messages and logging

### 🎨 UI/UX Improvements
- **Password Fields**: Labels moved outside input borders
- **Search Components**: Dynamic expandable search bars
- **Filter System**: Simplified ingredient selection
- **Theme**: Consistent kawaii/anime styling throughout

### 🔒 Security Fixes
- **API Key Protection**: No longer exposed to client-side
- **Input Validation**: Enhanced validation for all user inputs
- **CORS Resolution**: Proper API proxy implementation
- **XSS Prevention**: Removed potential XSS vulnerabilities

### 📚 Documentation
- **README**: Comprehensive setup and usage guide
- **SECURITY**: Complete security audit and recommendations
- **API Documentation**: Clear API proxy usage instructions

## [1.0.0] - Previous Version
- Initial release with Google Gemini integration
- Basic recipe generation and chat functionality
- Supabase authentication and data storage
