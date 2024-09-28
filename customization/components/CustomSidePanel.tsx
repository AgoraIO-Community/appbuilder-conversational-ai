import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "../../src/atoms/Card";
import { useRoomInfo, ThemeConfig } from "customization-api";

const CustomSidePanel = () => {
    const { data: { channel: channelName } } = useRoomInfo();
    return (
        <View style={styles.container}>
            <Card
                cardContainerStyle={{
                    ...styles.cardContainerStyle
                }}
            >
                <Text style={styles.textStyle}>INFO</Text>
                <Text style={styles.textStyle}>
                    Channel Name : {channelName}
                </Text>
            </Card>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
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
    }
});

export default CustomSidePanel;
