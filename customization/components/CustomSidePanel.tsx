import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "../../src/atoms/Card";
import { useRoomInfo, ThemeConfig, PreCallSelectDevice } from "customization-api";

const CustomSidePanel = () => {
    const { data: { channel: channelName } } = useRoomInfo();
    return (
        <View style={styles.container}>
            {/* Channel Info Card */}
            <Card
                cardContainerStyle={{
                    ...styles.cardContainerStyle,
                    flex: 2
                }}
            >
                <Text style={styles.textStyle}>INFO</Text>
                <Text style={styles.textStyle}>
                    Channel Name : {channelName}
                </Text>
            </Card>

            <View style={styles.spacer} />
            {/* Device Info Card */}
            <Card cardContainerStyle={{
                ...styles.cardContainerStyle,
                flex: 10
            }}>
                <Text style={styles.textStyle}>DEVICE</Text>
                <View style={styles.deviceInfoContainer}>
                    <PreCallSelectDevice />
                </View>
            </Card>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
    },
    textContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    textStyle: {
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 20,
        color: "rgba(255, 255, 255, 0.7)",
        fontFamily: ThemeConfig.FontFamily.sansPro,
        fontStyle: "normal"
    },
    cardContainerStyle: {
        padding: 16,
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        borderRadius: 8,
        margin: 0
    },
    deviceInfoContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 4,
    },
    spacer: {
        height: 20,
    },
});

export default CustomSidePanel;
