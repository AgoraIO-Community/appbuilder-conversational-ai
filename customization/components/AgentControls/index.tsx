import React, { useContext, useEffect } from 'react';
import { AI_AGENT_STATE, AIAgentState, AgentState, AI_AGENT_UID, AGENT_PROXY_URL} from "./const"
import { TouchableOpacity, Text } from "react-native";
import { AgentContext } from './AgentContext';
import { ThemeConfig, useContent } from "customization-api";

const CallIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.07102 16.7279C5.74082 15.3977 4.74462 13.8496 4.08241 12.0837C3.4202 10.3177 3.18079 8.47739 3.36419 6.56263C3.38901 6.36889 3.46435 6.20381 3.5902 6.0674C3.71606 5.93098 3.87567 5.86111 4.06904 5.85777L7.09844 5.80549C7.27032 5.80252 7.4409 5.87475 7.61019 6.02218C7.77947 6.16961 7.87337 6.32908 7.89189 6.50059L8.30385 9.69918C8.31255 9.81716 8.29996 9.92477 8.26606 10.022C8.23217 10.1193 8.17697 10.2061 8.10047 10.2826L5.822 12.5611C6.09055 13.1793 6.41893 13.7536 6.80713 14.2839C7.19534 14.8141 7.61114 15.301 8.05454 15.7444C8.49794 16.1878 8.98477 16.6036 9.51504 16.9918C10.0453 17.38 10.6196 17.7084 11.2378 17.9769L13.5163 15.6984C13.5928 15.6219 13.6797 15.5667 13.7769 15.5328C13.8741 15.4989 13.9817 15.4864 14.0997 15.4951L17.2983 15.907C17.5233 15.9353 17.6964 16.021 17.8174 16.1639C17.9385 16.3067 17.9971 16.4856 17.9934 16.7005L17.9411 19.7299C17.9378 19.9232 17.8679 20.0828 17.7315 20.2087C17.5951 20.3346 17.43 20.4099 17.2363 20.4347C15.3215 20.6181 13.4812 20.3787 11.7152 19.7165C9.94929 19.0543 8.40122 18.0581 7.07102 16.7279Z" fill="#00C2FF" />
    <path d="M9.99951 7.21275C9.99951 7.58826 10.2811 7.905 10.6565 7.95167C10.6649 7.95266 11.5281 8.07141 12.4317 8.59924C13.6307 9.29944 14.3283 10.3674 14.5053 11.7732C14.5523 12.1459 14.8713 12.4255 15.2495 12.4255C15.6277 12.4255 15.9467 12.1459 15.9937 11.7732C15.9947 11.7648 16.1143 10.9077 16.6459 10.0106C17.3511 8.82006 18.4267 8.12741 19.8425 7.95167C20.2179 7.905 20.4995 7.58826 20.4995 7.21275C20.4995 6.83723 20.2179 6.52049 19.8425 6.47383C19.8341 6.47284 18.9709 6.35408 18.0673 5.82626C16.8683 5.12606 16.1707 4.05809 15.9937 2.65234C15.9467 2.2796 15.6277 2 15.2495 2C14.8713 2 14.5523 2.2796 14.5053 2.65234C14.5043 2.66068 14.3847 3.51775 13.8531 4.41494C13.1479 5.60543 12.0723 6.29808 10.6565 6.47383C10.2811 6.52049 9.99951 6.83723 9.99951 7.21275ZM15.1459 5.17014C15.1719 5.12626 15.1971 5.08257 15.2215 5.03908C15.7037 5.88345 16.4049 6.58325 17.3067 7.10988C17.3509 7.1357 17.3949 7.16072 17.4387 7.18495C16.5883 7.66372 15.8835 8.35995 15.3531 9.25535C15.3271 9.29924 15.3019 9.34293 15.2775 9.38641C14.7953 8.54205 14.0941 7.84225 13.1923 7.31561C13.1481 7.2898 13.1041 7.26478 13.0603 7.24055C13.9107 6.76177 14.6155 6.06555 15.1459 5.17014Z" fill="#00C2FF" />
  </svg>
);

const connectToAIAgent = async (agentAction: 'start_agent' | 'stop_agent', channel_name: string): Promise<void> => {

    // const apiUrl = '/api/proxy'; 
    const apiUrl = AGENT_PROXY_URL; 
    const requestBody = {
      action: agentAction, 
      channel_name: channel_name,
      uid: AI_AGENT_UID
    };
    console.log({requestBody})
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log({data})
      console.log(
        `AI agent ${agentAction === 'start_agent' ? 'connected' : 'disconnected'}`,
        data
      );
    } catch (error) {
      console.error(`Failed to ${agentAction} AI agent connection:`, error);
      throw error;
    }
};

export const AgentControl: React.FC<{channel_name: string}> = ({channel_name}) => {
    const {agentConnectionState, setAgentConnectionState} = useContext(AgentContext);
    // const { users } = useContext(UserContext)
    const {  activeUids:users } = useContent();

    // const { toast } = useToast()  
    console.log("Agent Control--", {agentConnectionState}, {bth: AI_AGENT_STATE[agentConnectionState]})

      const handleConnectionToggle = async () => {
        try{
          // connect to agent when agent is in not connected state or when earlier connect failed
          if (agentConnectionState === AgentState.NOT_CONNECTED || agentConnectionState === AgentState.AGENT_REQUEST_FAILED){
            try{
              setAgentConnectionState(AgentState.REQUEST_SENT);
              await connectToAIAgent('start_agent', channel_name);
              setAgentConnectionState(AgentState.AWAITING_JOIN);
            //   toast({title: "Agent requested to join"})

            }catch(agentConnectError){
              setAgentConnectionState(AgentState.AGENT_REQUEST_FAILED);
            //   toast({
            //     title: "Uh oh! Agent failed to connect",
            //     description: `${agentConnectError}`,
            //     variant: "destructive",
            //     action: <ToastAction altText="Try again">Try again</ToastAction>,
            //   })
              throw agentConnectError
            }
          }
          // disconnect agent with agent is already connected or when earlier disconnect failed
          if(agentConnectionState === AgentState.AGENT_CONNECTED || agentConnectionState === AgentState.AGENT_DISCONNECT_FAILED){
            try{
              setAgentConnectionState(AgentState.AGENT_DISCONNECT_REQUEST);
              await connectToAIAgent('stop_agent', channel_name);
              setAgentConnectionState(AgentState.AWAITING_LEAVE);
            //   toast({ title: "Agent disconnecting..."})
            }catch(agentDisconnectError){
              setAgentConnectionState(AgentState.AGENT_DISCONNECT_FAILED);
            //   toast({
            //     title: "Uh oh! Agent failed to disconnect",
            //     description: `${agentDisconnectError}`,
            //     variant: "destructive",
            //     action: <ToastAction altText="Try again">Try again</ToastAction>,
            //   })
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
        if(users.length){
          const aiAgentUID = users.filter((item) => item === AI_AGENT_UID);
          console.log("agent contrl",{aiAgentUID})
          if(aiAgentUID.length){
            setAgentConnectionState(AgentState.AGENT_CONNECTED);
            // toast({title: "Say Hi!!"})
          }
        }
        // when agent leaves, show left toast, and set agent to not connected state
        if(!users.length && agentConnectionState === AgentState.AWAITING_LEAVE){
            // toast({ title: "Agent left the call"})
            setAgentConnectionState(AgentState.NOT_CONNECTED);
        }
      },[users])

    const isLoading = (agentConnectionState === AgentState.REQUEST_SENT 
        || agentConnectionState === AgentState.AGENT_DISCONNECT_REQUEST 
        || agentConnectionState === AgentState.AWAITING_LEAVE 
        || agentConnectionState === AgentState.AWAITING_JOIN)

    return(
        <div>
        <TouchableOpacity
            style={{
                display: 'flex',
                height: 48,
                padding: 20,
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
                borderRadius: 40, 
                borderWidth: 1, 
                borderColor: '#00C2FF',
                flexDirection:'row',
            }}        
            onPress={handleConnectionToggle}

            disabled={isLoading}
        >
          {!isLoading && <CallIcon/>}
            {isLoading && (
                // <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <>Loading..</>
            )}
       

            <Text  style={{color: '#00C2FF',fontFamily:ThemeConfig.FontFamily.sansPro}}>{`${AI_AGENT_STATE[agentConnectionState]}` }</Text>
        </TouchableOpacity>
        </div>
    )
}
