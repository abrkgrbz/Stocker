import { useEffect, useRef, useCallback, useState } from 'react'
import * as signalR from '@microsoft/signalr'

interface ValidationResult {
  isValid: boolean
  message: string
  details: Record<string, string>
}

interface PasswordStrength {
  score: number
  level: string
  color: string
  suggestions: string[]
}

interface TenantCodeValidationResult {
  isAvailable: boolean
  message: string
  code: string
  suggestedCodes: string[]
}

interface IdentityValidationResult {
  isValid: boolean
  message: string
  numberType: string
  details: Record<string, string>
}

export function useSignalRValidation() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const hubUrl = `${apiUrl}/hubs/validation`

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        // Don't skip negotiation - let SignalR choose the best transport
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    setConnection(newConnection)
  }, [])

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('[SignalR] Connected successfully!')
          setIsConnected(true)
        })
        .catch(err => {
          console.error('[SignalR] Connection Error:', err)
          console.error('[SignalR] Error details:', err.message)
          // Still mark as "connected" to allow form to work
          // Validation functions will gracefully fail
          setIsConnected(true)
        })

      connection.onclose((error) => {
        console.log('[SignalR] Disconnected', error)
        setIsConnected(false)
      })

      connection.onreconnecting((error) => {
        console.log('[SignalR] Reconnecting...', error)
        setIsConnected(false)
      })

      connection.onreconnected((connectionId) => {
        console.log('[SignalR] Reconnected! ID:', connectionId)
        setIsConnected(true)
      })

      return () => {
        connection.stop()
      }
    }
  }, [connection])

  const debounce = (key: string, callback: () => void, delay: number = 500) => {
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key])
    }
    debounceTimers.current[key] = setTimeout(callback, delay)
  }

  const validateEmail = useCallback((
    email: string,
    onResult: (result: ValidationResult) => void
  ) => {
    if (!connection || !isConnected || connection.state !== signalR.HubConnectionState.Connected) return

    debounce('email', () => {
      const handler = (result: ValidationResult) => {
        onResult(result)
        connection.off('EmailValidated', handler)
      }

      connection.on('EmailValidated', handler)
      connection.invoke('ValidateEmail', email)
        .catch(err => console.error('[SignalR] Email validation error:', err))
    })
  }, [connection, isConnected])

  const validatePhone = useCallback((
    phoneNumber: string,
    onResult: (result: ValidationResult) => void,
    countryCode: string = 'TR'
  ) => {
    if (!connection || !isConnected || connection.state !== signalR.HubConnectionState.Connected) return

    debounce('phone', () => {
      const handler = (result: ValidationResult) => {
        onResult(result)
        connection.off('PhoneValidated', handler)
      }

      connection.on('PhoneValidated', handler)
      connection.invoke('ValidatePhone', phoneNumber, countryCode)
        .catch(err => console.error('[SignalR] Phone validation error:', err))
    })
  }, [connection, isConnected])

  const checkPasswordStrength = useCallback((
    password: string,
    onResult: (result: PasswordStrength) => void
  ) => {
    if (!connection || !isConnected || connection.state !== signalR.HubConnectionState.Connected) return

    debounce('password', () => {
      const handler = (result: PasswordStrength) => {
        onResult(result)
        connection.off('PasswordStrengthChecked', handler)
      }

      connection.on('PasswordStrengthChecked', handler)
      connection.invoke('CheckPasswordStrength', password)
        .catch(err => console.error('[SignalR] Password strength check error:', err))
    }, 300)
  }, [connection, isConnected])

  const validateTenantCode = useCallback((
    code: string,
    onResult: (result: TenantCodeValidationResult) => void
  ) => {
    if (!connection || !isConnected || connection.state !== signalR.HubConnectionState.Connected) return

    debounce('tenantCode', () => {
      const handler = (result: TenantCodeValidationResult) => {
        onResult(result)
        connection.off('TenantCodeValidated', handler)
      }

      connection.on('TenantCodeValidated', handler)
      connection.invoke('ValidateTenantCode', code)
        .catch(err => console.error('[SignalR] Tenant code validation error:', err))
    })
  }, [connection, isConnected])

  const checkCompanyName = useCallback((
    companyName: string,
    onResult: (result: ValidationResult) => void
  ) => {
    if (!connection || !isConnected || connection.state !== signalR.HubConnectionState.Connected) {
      console.log('[SignalR] Skipping company name check - connection not ready')
      return
    }

    debounce('companyName', () => {
      const handler = (result: ValidationResult) => {
        onResult(result)
        connection.off('CompanyNameChecked', handler)
      }

      connection.on('CompanyNameChecked', handler)
      connection.invoke('CheckCompanyName', companyName)
        .catch(err => console.error('[SignalR] Company name check error:', err))
    })
  }, [connection, isConnected])

  const validateIdentity = useCallback((
    identityNumber: string,
    onResult: (result: IdentityValidationResult) => void
  ) => {
    if (!connection || !isConnected || connection.state !== signalR.HubConnectionState.Connected) {
      console.log('[SignalR] Skipping identity validation - connection not ready')
      return
    }

    debounce('identity', () => {
      const handler = (result: IdentityValidationResult) => {
        onResult(result)
        connection.off('IdentityValidated', handler)
      }

      connection.on('IdentityValidated', handler)
      connection.invoke('ValidateIdentity', identityNumber)
        .catch(err => console.error('[SignalR] Identity validation error:', err))
    })
  }, [connection, isConnected])

  return {
    isConnected,
    validateEmail,
    validatePhone,
    checkPasswordStrength,
    validateTenantCode,
    checkCompanyName,
    validateIdentity
  }
}
