import { httpClient } from '../api/httpClient'
import { HttpError } from '../api/errors'
import type { AuthSession } from '../auth/authStore'
import type { ApiLoginResponse, ApiUser } from '../types/api'

export interface Credentials {
  username: string
  password: string
}

export const authRepository = {
  // POST /auth/login -> accessToken, потім GET /auth/me із Bearer-токеном для даних користувача
  async login(credentials: Credentials): Promise<AuthSession> {
    let loginData: ApiLoginResponse
    try {
      loginData = await httpClient.post<ApiLoginResponse>('/auth/login', credentials)
    } catch (error) {
      if (error instanceof HttpError && (error.status === 400 || error.status === 401)) {
        throw new Error('Невірний username або пароль', { cause: error })
      }
      throw error
    }

    const user = await httpClient.get<ApiUser>('/auth/me', {
      token: loginData.accessToken,
    })

    return {
      accessToken: loginData.accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
      },
    }
  },
}
