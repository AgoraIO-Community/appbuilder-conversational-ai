import { ToolbarPreset, ToolbarComponents, useSidePanel, SidePanelType, useRoomInfo } from "customization-api";
import React,{ useEffect }  from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { AgentControl } from "./AgentControls";
import { AgentProvider } from './AgentControls/AgentContext';

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
          },
          "participant-count": {
            align: "start",
            component: ParticipantCountToolbarItem,
            order: 1,
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