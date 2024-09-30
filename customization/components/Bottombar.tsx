import { ToolbarPreset, ToolbarComponents, useSidePanel, SidePanelType, useRoomInfo,ThemeConfig } from "customization-api";
import React,{ useEffect }  from "react";
import { Text, View, TouchableOpacity,Image } from "react-native";
import { AgentControl } from "./AgentControls";
import { AgentProvider } from './AgentControls/AgentContext';
import { LogoIcon } from "./icons";

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
        color: '#00C2FF',
        textAlign: 'center',
        fontSize: 20,
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: 20, 
        fontFamily: ThemeConfig.FontFamily.sansPro
      }}>
        Agent Ten
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
  const { data } = useRoomInfo();

  useEffect(() => {
      setSidePanel(SidePanelType.Settings)
  }, [])
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
          },
          "participant-count": {
            align: "start",
            component: ParticipantCountToolbarItem,
            order: 2,
          },
         
          "connect-agent": {
            align: "end",
            label: 'Agent',
            component: () =>  <AgentControl channel_name={data.channel}/>,
            order: 3
          },
          'local-audio':{ align: 'end', order: 1},
          'end-call':{ align: 'end', order: 2 }
        }}
      />
    </AgentProvider>
  );
};

export default Bottombar;