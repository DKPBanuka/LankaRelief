import {
    List,
    Datagrid,
    TextField,
    DateField,
    SelectField,
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    FunctionField,
    SimpleList,
    EditButton,
    DeleteButton,
    ChipField,
    useRecordContext
} from 'react-admin';
import { useMediaQuery, Theme } from '@mui/material';
import { ColoredChipField } from '../components/ColoredChipField';

const ServiceRequestList = () => {
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

    return (
        <List sort={{ field: 'createdAt', order: 'DESC' }}>
            {isSmall ? (
                <SimpleList
                    primaryText={(record) => record.category}
                    secondaryText={(record) => `${record.location?.district} - ${record.status}`}
                    tertiaryText={(record) => new Date(record.createdAt).toLocaleDateString()}
                />
            ) : (
                <Datagrid rowClick="edit">
                    <ColoredChipField source="status" />
                    <ChipField source="category" />
                    <TextField source="location.district" label="District" />
                    <TextField source="location.address" label="Location" />
                    <TextField source="contact.name" label="Contact Name" />
                    <TextField source="contact.phone" label="Phone" />
                    <FunctionField
                        label="Details"
                        render={(record: any) => {
                            if (!record.details) return '-';
                            if (record.category === 'RESCUE') return `Water: ${record.details.waterLevel}, People: ${Object.values(record.details.peopleCount || {}).reduce((a: any, b: any) => a + b, 0)}`;
                            if (record.category === 'MEDICAL') return `Condition: ${record.details.condition}`;
                            return record.details.description || '-';
                        }}
                    />
                    <DateField source="createdAt" showTime />
                    <EditButton />
                    <DeleteButton />
                </Datagrid>
            )}
        </List>
    );
};

const ServiceRequestEdit = () => (
    <Edit>
        <SimpleForm>
            <SelectInput source="status" choices={[
                { id: 'PENDING', name: 'Pending' },
                { id: 'IN_PROGRESS', name: 'In Progress' },
                { id: 'COMPLETED', name: 'Completed' },
            ]} />
            <SelectInput source="category" choices={[
                { id: 'RESCUE', name: 'Rescue' },
                { id: 'MEDICAL', name: 'Medical' },
                { id: 'EVACUATION', name: 'Evacuation' },
                { id: 'CLEANUP', name: 'Cleanup' },
                { id: 'OTHER', name: 'Other' },
            ]} />

            <TextInput source="contact.name" label="Contact Name" />
            <TextInput source="contact.phone" label="Phone" />

            <SelectInput source="location.district" choices={[
                { id: 'Ampara', name: 'Ampara' },
                { id: 'Anuradhapura', name: 'Anuradhapura' },
                { id: 'Badulla', name: 'Badulla' },
                { id: 'Batticaloa', name: 'Batticaloa' },
                { id: 'Colombo', name: 'Colombo' },
                { id: 'Galle', name: 'Galle' },
                { id: 'Gampaha', name: 'Gampaha' },
                { id: 'Hambantota', name: 'Hambantota' },
                { id: 'Jaffna', name: 'Jaffna' },
                { id: 'Kalutara', name: 'Kalutara' },
                { id: 'Kandy', name: 'Kandy' },
                { id: 'Kegalle', name: 'Kegalle' },
                { id: 'Kilinochchi', name: 'Kilinochchi' },
                { id: 'Kurunegala', name: 'Kurunegala' },
                { id: 'Mannar', name: 'Mannar' },
                { id: 'Matale', name: 'Matale' },
                { id: 'Matara', name: 'Matara' },
                { id: 'Monaragala', name: 'Monaragala' },
                { id: 'Mullaitivu', name: 'Mullaitivu' },
                { id: 'Nuwara Eliya', name: 'Nuwara Eliya' },
                { id: 'Polonnaruwa', name: 'Polonnaruwa' },
                { id: 'Puttalam', name: 'Puttalam' },
                { id: 'Ratnapura', name: 'Ratnapura' },
                { id: 'Trincomalee', name: 'Trincomalee' },
                { id: 'Vavuniya', name: 'Vavuniya' },
            ]} label="District" />
            <TextInput source="location.address" label="Address" fullWidth />

            {/* Read-only view of details for context */}
            <FunctionField
                label="Current Details (Read-only)"
                render={(record: any) => (
                    <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                        {JSON.stringify(record.details, null, 2)}
                    </pre>
                )}
            />
        </SimpleForm>
    </Edit>
);

export default {
    list: ServiceRequestList,
    edit: ServiceRequestEdit,
};
