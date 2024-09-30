import { ToolbarPreset, ToolbarComponents, useSidePanel, SidePanelType, useRoomInfo,ThemeConfig } from "customization-api";
import React,{ useEffect }  from "react";
import { Text, View, TouchableOpacity,Image } from "react-native";
import { AgentControl } from "./AgentControls";
import { AgentProvider } from './AgentControls/AgentContext';

const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#00C2FF"/>
  <path d="M15.496 21.7876C14.3503 21.7876 13.2302 21.4482 12.2776 20.8122C11.3249 20.1763 10.5824 19.2724 10.1439 18.2148C9.70546 17.1573 9.59074 15.9936 9.81427 14.8709C10.0378 13.7482 10.5895 12.7169 11.3997 11.9075C12.2099 11.0981 13.2421 10.5469 14.3659 10.3236C15.4896 10.1003 16.6544 10.2149 17.7129 10.6529C18.7715 11.091 19.6762 11.8328 20.3128 12.7846C20.9493 13.7363 21.2891 14.8553 21.2891 16C21.2875 17.5345 20.6767 19.0057 19.5906 20.0908C18.5045 21.1758 17.032 21.7861 15.496 21.7876ZM22.2419 7.56827L22.1536 7.68579C22.1049 7.75071 22.0128 7.76384 21.9478 7.71517L21.836 7.62703C20.5071 6.6239 18.9584 5.95088 17.3178 5.66353C15.6773 5.37617 13.9918 5.48272 12.4005 5.97437C10.8093 6.46601 9.35788 7.32867 8.16609 8.49115C6.97429 9.65362 6.07629 11.0826 5.54619 12.6601C5.01608 14.2376 4.86908 15.9185 5.1173 17.5639C5.36553 19.2094 6.00186 20.7723 6.9738 22.1237C7.94573 23.475 9.2254 24.5761 10.7072 25.336C12.189 26.0959 13.8304 26.4929 15.496 26.4941C17.7869 26.5007 20.0158 25.7509 21.836 24.3612L21.9478 24.279C22.0117 24.2279 22.106 24.2418 22.1536 24.3083L22.2419 24.4259C22.6382 24.9723 23.1411 25.433 23.7202 25.7804C24.2993 26.1277 24.9428 26.3545 25.6118 26.4471C25.8172 26.4751 26 26.3155 26 26.1082V5.89175C26 5.68452 25.8172 5.52491 25.6118 5.55288C24.9433 5.64509 24.3003 5.8711 23.7212 6.2174C23.1422 6.56369 22.639 7.02315 22.2419 7.56827Z" fill="#111111"/>
  </svg>
  
);

const LogoComponent = () => {
  return(
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap:8
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
          "meeting-title": {
            align: "start",
            component: MeetingTitleToolbarItem,
            order: 0,
            hide: true
          },
          "participant-count": {
            align: "start",
            component: ParticipantCountToolbarItem,
            order: 1,
            hide: true
          },
          "logo":{
            align:'start',
            order:0,
            component:()=> <LogoComponent/>
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