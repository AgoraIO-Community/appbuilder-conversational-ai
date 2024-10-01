import { ToolbarPreset, ToolbarComponents, useSidePanel, SidePanelType, useRoomInfo,ThemeConfig, isMobileUA } from "customization-api";
import React,{ useEffect, useState, useRef }  from "react";
import { Text, View, TouchableOpacity,Image } from "react-native";
import { AgentControl } from "./AgentControls";
import { AgentProvider } from './AgentControls/AgentContext';
import { LogoIcon } from "./icons";
import { useMuteToggleLocal, MUTE_LOCAL_TYPE, useRtc } from "customization-api";


export const LogoComponent = () => {
  return(
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap:8,
      marginRight:20
    }}>
      <LogoIcon/>
      <Text style={{
        color: '#C3C3C3',
        textAlign: 'center',
        fontSize: 18,
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: 18, 
        fontFamily: ThemeConfig.FontFamily.sansPro
      }}>
        Agora & OpenAI Conversational AI Demo
      </Text>
    </View>
  )
}



const Bottombar = () => {
  const {
    MeetingTitleToolbarItem,
    ParticipantCountToolbarItem,
  } = ToolbarComponents;
  const { setSidePanel } = useSidePanel();
  const {RtcEngineUnsafe} = useRtc()
  const count = useRef<number>(0)
  const { data } = useRoomInfo();
  const [clientId, setClientId] = useState<string | null>(null);
  const muteToggleLocal = useMuteToggleLocal();

  useEffect(() => {
    !isMobileUA() && setSidePanel(SidePanelType.Settings)
  }, [])

  useEffect(() => {
    if(isMobileUA() && count.current < 2){
      muteToggleLocal(MUTE_LOCAL_TYPE.audio)
      count.current += 1
    }
  }, [RtcEngineUnsafe])

  return (
    <AgentProvider>
      <ToolbarPreset
        align="bottom"
        items={{
          layout: { hide: true},
          invite: { hide:true},
          more: {hide:true},
          "logo":{
            align:'start',
            order:0,
            component:()=> <LogoComponent/>
          },
          "meeting-title": {
            align: "start",
            component: MeetingTitleToolbarItem,
            order: 1,
            hide:true,
          },
          "participant-count": {
            align: "start",
            component: ParticipantCountToolbarItem,
            order: 2,
            hide:true,
          },
         
          "connect-agent": {
            align: "end",
            label: 'Agent',
            component: () =>  <AgentControl channel_name={data.channel}   clientId={clientId} 
            setClientId={setClientId} />,
            order: 3
          },
          'local-audio':{ align: 'end', order: 1},
          'end-call':{ align: 'end', order: 2, hide: true }
        }}
      />
    </AgentProvider>
  );
};

export default Bottombar;