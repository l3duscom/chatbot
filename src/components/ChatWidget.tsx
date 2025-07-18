import React, { useState, useEffect } from 'react'
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react'
import ChatInterface from './ChatInterface'
import { v4 as uuidv4 } from 'uuid'

interface ChatWidgetProps {
  chatbotId: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'light' | 'dark' | 'auto'
  primaryColor?: string
  greeting?: string
  placeholder?: string
  headerTitle?: string
  headerSubtitle?: string
  showBranding?: boolean
  minimized?: boolean
  onOpen?: () => void
  onClose?: () => void
  onMessage?: (message: any) => void
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  chatbotId,
  position = 'bottom-right',
  theme = 'auto',
  primaryColor = '#3b82f6',
  greeting = 'Olá! Como posso ajudá-lo?',
  placeholder = 'Digite sua mensagem...',
  headerTitle = 'Assistente',
  headerSubtitle = 'Online',
  showBranding = true,
  minimized = false,
  onOpen,
  onClose,
  onMessage,
}) => {
  const [isOpen, setIsOpen] = useState(!minimized)
  const [isMinimized, setIsMinimized] = useState(minimized)
  const [sessionId, setSessionId] = useState('')
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Gerar session ID único
    const session = localStorage.getItem('chatbot-session-id') || uuidv4()
    localStorage.setItem('chatbot-session-id', session)
    setSessionId(session)

    // Detectar tema
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setCurrentTheme(mediaQuery.matches ? 'dark' : 'light')
      
      const handleThemeChange = (e: MediaQueryListEvent) => {
        setCurrentTheme(e.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', handleThemeChange)
      return () => mediaQuery.removeEventListener('change', handleThemeChange)
    } else {
      setCurrentTheme(theme as 'light' | 'dark')
    }
  }, [theme])

  const toggleWidget = () => {
    setIsOpen(!isOpen)
    setHasNewMessage(false)
    
    if (!isOpen) {
      onOpen?.()
    } else {
      onClose?.()
    }
  }

  const minimizeWidget = () => {
    setIsMinimized(!isMinimized)
  }

  const handleMessageReceived = (message: any) => {
    if (!isOpen) {
      setHasNewMessage(true)
    }
    onMessage?.(message)
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      default:
        return 'bottom-4 right-4'
    }
  }

  const getWidgetClasses = () => {
    const baseClasses = 'fixed z-50 transition-all duration-300 ease-in-out'
    const positionClasses = getPositionClasses()
    
    if (isOpen && !isMinimized) {
      return `${baseClasses} ${positionClasses} w-80 h-96 sm:w-96 sm:h-[500px]`
    } else {
      return `${baseClasses} ${positionClasses}`
    }
  }

  const customStyles = {
    '--primary-color': primaryColor,
    '--primary-color-dark': primaryColor.replace(')', ', 0.8)').replace('rgb', 'rgba'),
  } as React.CSSProperties

  return (
    <div className={getWidgetClasses()} style={customStyles}>
      {/* Widget Button */}
      {(!isOpen || isMinimized) && (
        <button
          onClick={toggleWidget}
          className={`
            relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center
            transition-all duration-300 transform hover:scale-110
            ${currentTheme === 'dark' 
              ? 'bg-gray-800 text-white hover:bg-gray-700' 
              : 'bg-white text-gray-800 hover:bg-gray-50'
            }
          `}
          style={{
            backgroundColor: primaryColor,
            color: 'white',
          }}
        >
          <MessageCircle size={24} />
          
          {/* Notification Badge */}
          {hasNewMessage && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && !isMinimized && (
        <div className={`
          w-full h-full rounded-lg shadow-2xl overflow-hidden
          ${currentTheme === 'dark' 
            ? 'bg-gray-900 border border-gray-700' 
            : 'bg-white border border-gray-200'
          }
        `}>
          {/* Header */}
          <div className={`
            flex items-center justify-between p-4 border-b
            ${currentTheme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                AI
              </div>
              <div>
                <h3 className={`font-medium text-sm ${
                  currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {headerTitle}
                </h3>
                <p className={`text-xs ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {headerSubtitle}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={minimizeWidget}
                className={`
                  p-1 rounded hover:bg-gray-100 transition-colors
                  ${currentTheme === 'dark' 
                    ? 'text-gray-400 hover:bg-gray-700' 
                    : 'text-gray-500 hover:bg-gray-100'
                  }
                `}
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={toggleWidget}
                className={`
                  p-1 rounded hover:bg-gray-100 transition-colors
                  ${currentTheme === 'dark' 
                    ? 'text-gray-400 hover:bg-gray-700' 
                    : 'text-gray-500 hover:bg-gray-100'
                  }
                `}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="h-full pb-16">
            <ChatInterface
              chatbotId={chatbotId}
              sessionId={sessionId}
              onMessageReceived={handleMessageReceived}
              theme={currentTheme}
              className="h-full"
            />
          </div>

          {/* Branding */}
          {showBranding && (
            <div className={`
              absolute bottom-2 right-2 text-xs opacity-50
              ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
            `}>
              Powered by ChatBot IA
            </div>
          )}
        </div>
      )}

      {/* Minimized State */}
      {isOpen && isMinimized && (
        <div className={`
          w-64 h-12 rounded-lg shadow-lg flex items-center justify-between px-4
          ${currentTheme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
          }
        `}>
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              AI
            </div>
            <span className={`text-sm font-medium ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {headerTitle}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={minimizeWidget}
              className={`
                p-1 rounded hover:bg-gray-100 transition-colors
                ${currentTheme === 'dark' 
                  ? 'text-gray-400 hover:bg-gray-700' 
                  : 'text-gray-500 hover:bg-gray-100'
                }
              `}
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={toggleWidget}
              className={`
                p-1 rounded hover:bg-gray-100 transition-colors
                ${currentTheme === 'dark' 
                  ? 'text-gray-400 hover:bg-gray-700' 
                  : 'text-gray-500 hover:bg-gray-100'
                }
              `}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWidget

// Script para inicializar o widget
export const initChatWidget = (config: Partial<ChatWidgetProps> & { chatbotId: string }) => {
  // Verificar se React está disponível
  if (typeof window !== 'undefined' && window.React) {
    const container = document.createElement('div')
    container.id = 'chatbot-widget-container'
    document.body.appendChild(container)

    const root = window.ReactDOM.createRoot(container)
    root.render(window.React.createElement(ChatWidget, config))
  } else {
    console.error('React is required to initialize the chat widget')
  }
}

// Adicionar ao window para uso externo
declare global {
  interface Window {
    ChatbotWidget: {
      init: typeof initChatWidget
    }
    React: any
    ReactDOM: any
  }
}

if (typeof window !== 'undefined') {
  window.ChatbotWidget = {
    init: initChatWidget,
  }
} 