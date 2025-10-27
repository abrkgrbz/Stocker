import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { DataTable, Searchbar, FAB } from 'react-native-paper';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

const products = [
  { id: 1, name: 'Product A', category: 'Category 1', price: 100, stock: 10 },
  { id: 2, name: 'Product B', category: 'Category 2', price: 150, stock: 5 },
  { id: 3, name: 'Product C', category: 'Category 1', price: 200, stock: 20 },
  { id: 4, name: 'Product D', category: 'Category 3', price: 250, stock: 15 },
  { id: 5, name: 'Product E', category: 'Category 2', price: 300, stock: 8 },
];

const InventoryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search products"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title>Category</DataTable.Title>
          <DataTable.Title numeric>Price</DataTable.Title>
          <DataTable.Title numeric>Stock</DataTable.Title>
        </DataTable.Header>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DataTable.Row>
              <DataTable.Cell>{item.name}</DataTable.Cell>
              <DataTable.Cell>{item.category}</DataTable.Cell>
              <DataTable.Cell numeric>{item.price}</DataTable.Cell>
              <DataTable.Cell numeric>{item.stock}</DataTable.Cell>
            </DataTable.Row>
          )}
        />
      </DataTable>
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => console.log('Add product')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  searchbar: {
    margin: Theme.light.spacing.md,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});

export default InventoryScreen;
