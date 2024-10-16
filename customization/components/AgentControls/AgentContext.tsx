import React, { createContext, useState } from 'react';
import {AIAgentState, AgentState} from "./const"

export interface AgentContextInterface {
    agentConnectionState:AIAgentState,
    setAgentConnectionState: (agentState: AIAgentState) => void,
    agentAuthToken: string|null,
    setAgentAuthToken: (token: string | null) => void

}

export const AgentContext = createContext<AgentContextInterface>({
    agentConnectionState: AgentState.NOT_CONNECTED,
    setAgentConnectionState: () => {},
    agentAuthToken:null,
    setAgentAuthToken: () => {}
})

export const AgentProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [agentConnectionState, setAgentConnectionState] = useState<AIAgentState>(AgentState.NOT_CONNECTED);
    const [agentAuthToken,setAgentAuthToken] = useState<string|null>(null)

    const value = {
        agentConnectionState,
        setAgentConnectionState,
        agentAuthToken,
        setAgentAuthToken
    }

    return (
        <AgentContext.Provider value={value}>
            {children}
        </AgentContext.Provider>
    )
} 