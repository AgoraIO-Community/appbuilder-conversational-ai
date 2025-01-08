import React, { createContext, useState } from 'react';
import {AIAgentState, AgentState} from "./const"
import {UidType} from "customization-api"

export interface AgentContextInterface {
    agentConnectionState:AIAgentState,
    setAgentConnectionState: (agentState: AIAgentState) => void,
    agentAuthToken: string|null,
    setAgentAuthToken: (token: string | null) => void,
    isSubscribedForStreams: boolean;
    setIsSubscribedForStreams: (state:boolean) => void
    agentUID:UidType|null,
    setAgentUID: (uid: UidType|null) => void
}

export const AgentContext = createContext<AgentContextInterface>({
    agentConnectionState: AgentState.NOT_CONNECTED,
    setAgentConnectionState: () => {},
    agentAuthToken:null,
    setAgentAuthToken: () => {},
    isSubscribedForStreams:false,
    setIsSubscribedForStreams:() =>{},
    agentUID:null,
    setAgentUID: () => {}
})

export const AgentProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [agentConnectionState, setAgentConnectionState] = useState<AIAgentState>(AgentState.NOT_CONNECTED);
    const [agentAuthToken,setAgentAuthToken] = useState<string|null>(null);
    const [agentUID, setAgentUID] = useState<UidType|null>(null);
    const [isSubscribedForStreams,setIsSubscribedForStreams] = useState(false)
    

    const value = {
        agentConnectionState,
        setAgentConnectionState,
        agentAuthToken,
        setAgentAuthToken,
        isSubscribedForStreams,
        setIsSubscribedForStreams,
        agentUID,
        setAgentUID
    }

    return (
        <AgentContext.Provider value={value}>
            {children}
        </AgentContext.Provider>
    )
} 