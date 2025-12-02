import { Admin, Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { NeedList, NeedEdit } from './resources/needs';
import { PersonList, PersonEdit } from './resources/people';
import { VolunteerList } from './resources/volunteers';
import ServiceRequests from './resources/serviceRequests';
import { Package, Users, UserCheck, Megaphone } from 'lucide-react';
import { adminTheme } from './theme';
import { CustomLayout } from './layout';

const AdminApp = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        theme={adminTheme}
        layout={CustomLayout}
    >
        <Resource
            name="needs"
            list={NeedList}
            edit={NeedEdit}
            icon={Package}
            options={{ label: 'Donations' }}
        />
        <Resource
            name="people"
            list={PersonList}
            edit={PersonEdit}
            icon={UserCheck}
            options={{ label: 'Missing Persons' }}
        />
        <Resource
            name="volunteers"
            list={VolunteerList}
            icon={Users}
            options={{ label: 'Volunteers' }}
        />
        <Resource
            name="service_requests"
            list={ServiceRequests.list}
            edit={ServiceRequests.edit}
            icon={Megaphone}
            options={{ label: 'Service Requests' }}
        />
    </Admin>
);

export default AdminApp;
