import {
    List,
    Datagrid,
    TextField,
    DateField,
    ChipField,
    EditButton,
    DeleteButton,
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    NumberInput,
    BooleanInput,
    SimpleList
} from 'react-admin';
import { Theme, useMediaQuery } from '@mui/material';

import { ColoredChipField } from '../components/ColoredChipField';

const needFilters = [
    <TextInput source="q" label="Search" alwaysOn />,
    <SelectInput source="status" choices={[
        { id: 'REQUESTED', name: 'Requested' },
        { id: 'PARTIALLY_PLEDGED', name: 'Partially Pledged' },
        { id: 'FULLY_PLEDGED', name: 'Fully Pledged' },
        { id: 'RECEIVED', name: 'Received' },
    ]} />,
    <SelectInput source="district" choices={[
        { id: 'Colombo', name: 'Colombo' },
        { id: 'Gampaha', name: 'Gampaha' },
        { id: 'Kalutara', name: 'Kalutara' },
    ]} />,
];

export const NeedList = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
    return (
        <List filters={needFilters}>
            {isSmall ? (
                <SimpleList
                    primaryText={record => record.item}
                    secondaryText={record => `${record.category} - ${record.district}`}
                    tertiaryText={record => record.status}
                />
            ) : (
                <Datagrid rowClick="edit">
                    <TextField source="item" label="Item Name" sx={{ fontWeight: 'bold' }} />
                    <TextField source="category" />
                    <TextField source="contactName" label="Contact" />
                    <TextField source="district" />
                    <ColoredChipField
                        source="status"
                        size="small"
                        colors={{
                            REQUESTED: 'warning',
                            PARTIALLY_PLEDGED: 'info',
                            FULLY_PLEDGED: 'primary',
                            RECEIVED: 'success'
                        }}
                    />
                    <DateField source="createdAt" />
                    <EditButton />
                    <DeleteButton />
                </Datagrid>
            )}
        </List>
    );
};

export const NeedEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="item" />
            <SelectInput source="category" choices={[
                { id: 'FOOD', name: 'Food' },
                { id: 'MEDICINE', name: 'Medicine' },
                { id: 'WATER', name: 'Water' },
                { id: 'CLOTHING', name: 'Clothing' },
                { id: 'BABY_ITEMS', name: 'Baby Items' },
                { id: 'OTHER', name: 'Other' },
            ]} />
            <SelectInput source="urgency" choices={[
                { id: 'LOW', name: 'Low' },
                { id: 'MEDIUM', name: 'Medium' },
                { id: 'HIGH', name: 'High' },
            ]} />
            <NumberInput source="quantity" />
            <TextInput source="unit" />
            <TextInput source="contactName" />
            <TextInput source="contactNumber" />
            <SelectInput source="district" choices={[
                { id: 'Colombo', name: 'Colombo' },
                { id: 'Gampaha', name: 'Gampaha' },
                { id: 'Kalutara', name: 'Kalutara' },
                // Add other districts as needed or import from types
            ]} />
            <TextInput source="location" />
            <SelectInput source="status" choices={[
                { id: 'REQUESTED', name: 'Requested' },
                { id: 'PARTIALLY_PLEDGED', name: 'Partially Pledged' },
                { id: 'FULLY_PLEDGED', name: 'Fully Pledged' },
                { id: 'RECEIVED', name: 'Received' },
            ]} />
            <TextInput source="description" multiline rows={5} />
        </SimpleForm>
    </Edit>
);
