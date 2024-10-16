import {AGENT_PROXY_URL, AGORA_SSO_LOGIN, AGORA_SSO_CLIENT_ID} from "../components/AgentControls/const"

export const handleSSOLogin = () => {
    const REDIRECT_URL=`${AGENT_PROXY_URL}/login`;
    const originURL = window.location.origin+'/validate'

    const ssoUrl = `${AGORA_SSO_LOGIN}?scope=basic_info&response_type=code&state=url=${originURL}&redirect_uri=${REDIRECT_URL}&client_id=${AGORA_SSO_CLIENT_ID}`;
    console.log('sso',ssoUrl)
    window.location.href = ssoUrl;

  };
