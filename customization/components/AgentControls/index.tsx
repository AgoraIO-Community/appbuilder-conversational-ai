import React, { useContext, useEffect, useState, useRef } from 'react';
import { AI_AGENT_STATE, AIAgentState, AgentState, AI_AGENT_UID, AGENT_PROXY_URL} from "./const"
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { AgentContext } from './AgentContext';
import Toast from "../../../react-native-toast-message/index";

import { isMobileUA, ThemeConfig, useContent, useEndCall } from "customization-api";
import { CallIcon, EndCall } from '../icons';

const connectToAIAgent = async (
  agentAction: 'start_agent' | 'stop_agent', 
  channel_name: string,
  clientId?:string): Promise<string | void> => {

    // const apiUrl = '/api/proxy'; 
    const apiUrl = AGENT_PROXY_URL; 
    const requestBody = {
      action: agentAction, 
      channel_name: channel_name,
      uid: AI_AGENT_UID
    };
    console.log({requestBody})
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (agentAction === 'stop_agent' && clientId) {
        headers['X-Client-ID'] = clientId;
    }

    try {
      const response = await fetch(`${apiUrl}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // console.log({data}, "X-Client-ID start stop")
      console.log(
        `AI agent ${agentAction === 'start_agent' ? 'connected' : 'disconnected'}`,
        data
      );
      if (agentAction === 'start_agent' && data.clientID) {
        return data.clientID;
      }
    } catch (error) {
      console.error(`Failed to ${agentAction} AI agent connection:`, error);
      throw error;
    }
};
const pingAIAgent = async (channel_name: string, clientId: string): Promise<void> => {
  console.log("start ping apicall- begin")
  const apiUrl = AGENT_PROXY_URL;
  // const headers: HeadersInit = {
  //   'X-Client-ID': clientId,
  // };
  console.log("start ping apicall")
  try {
    const response = await fetch(`https://nodejs-serverless-function-express-alpha-smoky.vercel.app/api/ping?channel_name=${encodeURIComponent(channel_name)}&action=ping-agent`, {
      method: 'GET',
      // headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI agent ping response:', data);
  } catch (error) {
    console.error('Failed to ping AI agent:', error);
    throw error;
  }
};
export const AgentControl: React.FC<{channel_name: string, style: object, clientId: string, setClientId: () => void}> = ({channel_name,style,clientId,setClientId}) => {
    const {agentConnectionState, setAgentConnectionState} = useContext(AgentContext);
    // console.log("X-Client-ID state", clientId)
    // const { users } = useContext(UserContext)
    const {  activeUids:users } = useContent();
    const endcall =  useEndCall();
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    // stop_agent API is successful, but agent has not yet left the RTC channel
    const isAwaitingLeave = agentConnectionState === AgentState.AWAITING_LEAVE

    const startPingInterval = () => {
      console.log("start ping interval")
      if (pingIntervalRef.current) {
        console.log("clear ping interval")
        clearInterval(pingIntervalRef.current);
      }
      pingIntervalRef.current = setInterval(() => {
        console.log("start ping setinterval")
        pingAIAgent(channel_name, clientId)
          .catch(error => console.error('Failed to ping agent:', error));
      }, 1000); // 3 minutes
    };
  
    const stopPingInterval = () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };

    // const { toast } = useToast()  
    console.log("Agent Control--", {agentConnectionState}, {bth: AI_AGENT_STATE[agentConnectionState]})

      const handleConnectionToggle = async () => {
        try{
          // connect to agent when agent is in not connected state or when earlier connect failed
          if (agentConnectionState === AgentState.NOT_CONNECTED 
            || agentConnectionState === AgentState.AGENT_REQUEST_FAILED
            || isAwaitingLeave
          ){
            try{
              setAgentConnectionState(AgentState.REQUEST_SENT);
              const newClientId = await connectToAIAgent('start_agent', channel_name);
              // console.log("response X-Client-ID", newClientId, typeof newClientId)
              console.log("start complet, pinging", typeof newClientId, newClientId)
              startPingInterval(); // Start pinging after successful connection
              if(typeof newClientId === 'string'){
                setClientId(newClientId);
              }
              setAgentConnectionState(AgentState.AWAITING_JOIN);
            //   toast({title: "Agent requested to join"})

              Toast.show({
                leadingIconName: 'tick-fill',
                type: 'success',
                text1: "Agent requested to join",
                text2: null,
                visibilityTime: 3000,
                primaryBtn: null,
                secondaryBtn: null,
                leadingIcon: null,
              })
            }catch(agentConnectError){
              setAgentConnectionState(AgentState.AGENT_REQUEST_FAILED);
            //   toast({
            //     title: "Uh oh! Agent failed to connect",
            //     description: `${agentConnectError}`,
            //     variant: "destructive",
            //     action: <ToastAction altText="Try again">Try again</ToastAction>,
            //   })
              Toast.show({
                leadingIconName: 'alert',
                type: 'error',
                text1: "Uh oh! Agent failed to connect",
                text2: null,
                visibilityTime: 5000,
                primaryBtn: null,
                secondaryBtn: null,
                leadingIcon: null,
              })

              throw agentConnectError
            }
          }
          // disconnect agent with agent is already connected or when earlier disconnect failed
          if(agentConnectionState === AgentState.AGENT_CONNECTED 
            || agentConnectionState === AgentState.AGENT_DISCONNECT_FAILED
          ){
            if(isMobileUA()){
              await endcall()
              setAgentConnectionState(AgentState.NOT_CONNECTED);
              stopPingInterval(); // Stop pinging when disconnecting
              return // check later
            }
            try{
              setAgentConnectionState(AgentState.AGENT_DISCONNECT_REQUEST);
              await connectToAIAgent('stop_agent', channel_name, clientId || undefined);
              setAgentConnectionState(AgentState.AWAITING_LEAVE);
              stopPingInterval(); // Stop pinging when disconnecting
              // toast({ title: "Agent disconnecting..."})
              Toast.show({
                leadingIconName: 'tick-fill',
                type: 'success',
                text1: "Agent disconnected",
                text2: null,
                visibilityTime: 3000,
                primaryBtn: null,
                secondaryBtn: null,
                leadingIcon: null,
              })

            }catch(agentDisconnectError){
              setAgentConnectionState(AgentState.AGENT_DISCONNECT_FAILED);
            //   toast({
            //     title: "Uh oh! Agent failed to disconnect",
            //     description: `${agentDisconnectError}`,
            //     variant: "destructive",
            //     action: <ToastAction altText="Try again">Try again</ToastAction>,
            //   })
              Toast.show({
                leadingIconName: 'alert',
                type: 'error',
                text1: "Uh oh! Agent failed to disconnect",
                text2: null,
                visibilityTime: 5000,
                primaryBtn: null,
                secondaryBtn: null,
                leadingIcon: null,
              })

              throw agentDisconnectError
            }
          }
        }catch(error){
          console.log(`Agent failed to connect/disconnect - ${error}`)
        }
      };
    
      useEffect(() => {
        console.log("agent contrl", {users})
        // welcome agent
        const aiAgentUID = users.filter((item) => item === AI_AGENT_UID);
          if(aiAgentUID.length && agentConnectionState === AgentState.AWAITING_JOIN){
            setAgentConnectionState(AgentState.AGENT_CONNECTED);
            // toast({title: "Say Hi!!"})
            Toast.show({
              leadingIconName: 'tick-fill',
              type: 'success',
              text1: "Say Hi!!",
              text2: null,
              visibilityTime: 3000,
              primaryBtn: null,
              secondaryBtn: null,
              leadingIcon: null,
            })
            
          }
        // when agent leaves, show left toast, and set agent to not connected state
        if(!aiAgentUID.length && agentConnectionState === AgentState.AWAITING_LEAVE){
            // toast({ title: "Agent left the call"})
            // Toast.show({
            //   leadingIconName: 'tick-fill',
            //   type: 'success',
            //   text1: "Agent left the call",
            //   text2: null,
            //   visibilityTime: 3000,
            //   primaryBtn: null,
            //   secondaryBtn: null,
            //   leadingIcon: null,
            // })
            setAgentConnectionState(AgentState.NOT_CONNECTED);
        }
        return () => {
          stopPingInterval();
        };
      },[users])
    
    const isLoading = (agentConnectionState === AgentState.REQUEST_SENT 
        || agentConnectionState === AgentState.AGENT_DISCONNECT_REQUEST 
        // || agentConnectionState === AgentState.AWAITING_LEAVE 
        || agentConnectionState === AgentState.AWAITING_JOIN)
    
    const isStartAgent = (agentConnectionState === AgentState.NOT_CONNECTED || agentConnectionState === AgentState.AGENT_REQUEST_FAILED || isAwaitingLeave)
    const isEndAgent = (agentConnectionState === AgentState.AGENT_CONNECTED || agentConnectionState === AgentState.AGENT_DISCONNECT_FAILED)

    const backgroundColorStyle = isMobileUA() ? {backgroundColor: isEndAgent ? '#FF414D' : '#00C2FF', height: 72} : {}
    const fontcolorStyle = isMobileUA() ? {color: '#FFF'} : {color: isEndAgent ? '#FF414D' : '#00C2FF'}
    return(
        <TouchableOpacity
            style={{
                display: 'flex',
                height: 48,
                padding: 20,
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
                borderRadius: 40, 
                borderWidth: isMobileUA() ? 0 : 1, 
                borderColor: isEndAgent ? '#FF414D' : '#00C2FF',
                flexDirection:'row',
                ...backgroundColorStyle
            }}        
            onPress={handleConnectionToggle}

            disabled={isLoading}
        >
          {isLoading ? 
          <ActivityIndicator size="small" color={isMobileUA() ? "#FFFFFF" : "#00C2FF"} /> 
          : isStartAgent ?  <CallIcon fill={isMobileUA() ? '#FFFFFF' : '#00C2FF'} /> 
          : <EndCall fill={isMobileUA() ? '#FFFFFF' : '#FF414D'} />}
          
            <Text style={{ 
              fontFamily:ThemeConfig.FontFamily.sansPro,
              ...fontcolorStyle,
              ...style,
            }}>{`${AI_AGENT_STATE[agentConnectionState]}` }</Text>
        </TouchableOpacity>
    )
}
