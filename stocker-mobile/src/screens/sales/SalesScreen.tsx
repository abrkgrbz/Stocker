import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { DataTable, FAB } from 'react-native-paper';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

const sales = [
  { id: 1, customer: 'Customer A', date: '2023-10-26', total: 500, status: 'Completed' },
  { id: 2, customer: 'Customer B', date: '2023-10-25', total: 750, status: 'Pending' },
  { id: 3, customer: 'Customer C', date: '2023-10-24', total: 1000, status: 'Completed' },
  { id: 4, customer: 'Customer D', date: '2023-10-23', total: 1250, status: 'Cancelled' },
  { id: 5, customer: 'Customer E', date: '2023-10-22', total: 1500, status: 'Completed' },
];

const SalesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Customer</DataTable.Title>
          <DataTable.Title>Date</DataTable.Title>
          <DataTable.Title numeric>Total</DataTable.Title>
          <DataTable.Title>Status</DataTable.Title>
        </DataTable.Header>

        <FlatList
          data={sales}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DataTable.Row>
              <DataTable.Cell>{item.customer}</DataTable.Cell>
              <DataTable.Cell>{item.date}</DataTable.Cell>
              <DataTable.Cell numeric>{item.total}</DataTable.Cell>
              <DataTable.Cell>{item.status}</DataTable.Cell>
            </DataTable.Row>
          )}
        />
      </DataTable>
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => console.log('Add sale')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});

export default SalesScreen;
