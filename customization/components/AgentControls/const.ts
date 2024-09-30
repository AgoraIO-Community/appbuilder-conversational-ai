import{ UID} from 'agora-rtc-sdk-ng';

export const AI_AGENT_STATE = {
    'NOT_CONNECTED': "Connect Agent",
    'REQUEST_SENT': "Requesting agent join..",
    'AWAITING_JOIN': "Agent will join shortly..",
    "AGENT_CONNECTED": "Disconnect Agent",
    'AGENT_REQUEST_FAILED': 'Agent failed to connect - Try again',
    'AGENT_DISCONNECT_REQUEST': 'Disconnecting agent...',
    'AGENT_DISCONNECT_FAILED': 'Agent failed to disconnect - Try again',
    'AWAITING_LEAVE': "Bye Bye, Agent"
} as const;

export type AIAgentState = keyof typeof AI_AGENT_STATE

export const AGENT_STATE_TO_API_ACTION = {
    'NOT_CONNECTED': 'start_agent',
    'AGENT_CONNECTED': 'stop_agent'
} as const;

export type AgentStateToApiAction = keyof typeof AGENT_STATE_TO_API_ACTION; 

export const enum AgentState {
    NOT_CONNECTED = 'NOT_CONNECTED',
    REQUEST_SENT = 'REQUEST_SENT',
    AWAITING_JOIN = 'AWAITING_JOIN',
    AGENT_CONNECTED = 'AGENT_CONNECTED',
    AGENT_REQUEST_FAILED = 'AGENT_REQUEST_FAILED',
    AGENT_DISCONNECT_REQUEST= 'AGENT_DISCONNECT_REQUEST',
    AGENT_DISCONNECT_FAILED= 'AGENT_DISCONNECT_FAILED',
    AWAITING_LEAVE= 'AWAITING_LEAVE',

}

export const AI_AGENT_UID = 123;

// export const AGENT_PROXY_URL = "http://localhost:3000/api/proxy"
// export const AGENT_PROXY_URL = "https://conversational-ai-agent-git-testing-cors-agoraio.vercel.app/api/proxy"
export const AGENT_PROXY_URL = "https://nodejs-serverless-function-express-alpha-smoky.vercel.app/api/hello?name=sdgfhjgk&channel_name=channelB&uid=123&action=start_agent"
// export const AGENT_PROXY_URL = "https://conversational-ai-agent-git-setmute-agoraio.vercel.app/api/proxy"
