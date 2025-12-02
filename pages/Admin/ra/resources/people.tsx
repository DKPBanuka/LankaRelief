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
    ImageField,
    SimpleList
} from 'react-admin';
import { Theme, useMediaQuery } from '@mui/material';

import { ColoredChipField } from '../components/ColoredChipField';

const personFilters = [
    <TextInput source="q" label="Search" alwaysOn />,
    <SelectInput source="status" choices={[
        { id: 'MISSING', name: 'Missing' },
        { id: 'SAFE', name: 'Safe' },
        { id: 'DECEASED', name: 'Deceased' },
    ]} />,
];

export const PersonList = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
    return (
        <List filters={personFilters}>
            {isSmall ? (
                <SimpleList
                    primaryText={record => record.name}
                    secondaryText={record => `${record.age} yrs - ${record.district}`}
                    tertiaryText={record => record.status}
                    leftAvatar={record => <img src={record.image} alt={record.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />}
                />
            ) : (
                <Datagrid rowClick="edit">
                    <ImageField source="image" label="Photo" sx={{ '& img': { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' } }} />
                    <TextField source="name" sx={{ fontWeight: 'bold' }} />
                    <TextField source="age" />
                    <TextField source="gender" />
                    <TextField source="district" />
                    <ColoredChipField
                        source="status"
                        size="small"
                        colors={{
                            MISSING: 'error',
                            SAFE: 'success',
                            DECEASED: 'default'
                        }}
                    />
                    <DateField source="updatedAt" label="Last Updated" />
                    <EditButton />
                    <DeleteButton />
                </Datagrid>
            )}
        </List>
    );
};

export const PersonEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" />
            <NumberInput source="age" />
            <SelectInput source="gender" choices={[
                { id: 'Male', name: 'Male' },
                { id: 'Female', name: 'Female' },
                { id: 'Other', name: 'Other' },
            ]} />
            <SelectInput source="district" choices={[
                { id: 'Colombo', name: 'Colombo' },
                { id: 'Gampaha', name: 'Gampaha' },
                { id: 'Kalutara', name: 'Kalutara' },
                // Add others
            ]} />
            <TextInput source="lastSeenLocation" />
            <DateField source="lastSeenDate" />
            <SelectInput source="status" choices={[
                { id: 'MISSING', name: 'Missing' },
                { id: 'SAFE', name: 'Safe' },
            ]} />
            <TextInput source="physicalDescription" multiline rows={5} />
            <TextInput source="reporterName" />
            <TextInput source="reporterContact" />
            <TextInput source="message" multiline />
        </SimpleForm>
    </Edit>
);
