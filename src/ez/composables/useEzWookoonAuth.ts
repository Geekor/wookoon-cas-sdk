import { useAuth } from '../../vue/use-auth.ts'
import { WK_CAS_CALLBACK_PATH } from '../consts.ts'
import { useRouter } from "vue-router"

export function useEzWookoonAuth() {
    const router = useRouter()
    const {
        user,
        isAuthenticated,
        isLoading,

        getAccessToken,

        login: sdkLogin,
        logout: sdkLogout,
        profile: sdkProfile,
    } = useAuth()

    function login() {
        const url = new URL(
            router.resolve({ path: WK_CAS_CALLBACK_PATH }).href,
            window.location.origin,
        ).href

        sdkLogin(url)
    }

    function logout() {
        sdkLogout()
    }

    return {
        user,
        isAuthenticated,
        isLoading,

        login,
        logout,
        profile: sdkProfile,
        getAccessToken,
    }
}