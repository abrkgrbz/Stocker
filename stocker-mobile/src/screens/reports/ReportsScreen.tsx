import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List } from 'react-native-paper';
import { Colors } from '../../constants/colors';

const ReportsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <List.Section title="Available Reports">
        <List.Item
          title="Sales Report"
          description="View detailed sales reports"
          left={(props) => <List.Icon {...props} icon="chart-bar" />}
          onPress={() => console.log('Sales Report')}
        />
        <List.Item
          title="Inventory Report"
          description="View detailed inventory reports"
          left={(props) => <List.Icon {...props} icon="cube" />}
          onPress={() => console.log('Inventory Report')}
        />
        <List.Item
          title="Customer Report"
          description="View detailed customer reports"
          left={(props) => <List.Icon {...props} icon="account-group" />}
          onPress={() => console.log('Customer Report')}
        />
        <List.Item
          title="Financial Report"
          description="View detailed financial reports"
          left={(props) => <List.Icon {...props} icon="currency-usd" />}
          onPress={() => console.log('Financial Report')}
        />
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
});

export default ReportsScreen;
