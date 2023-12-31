
import { authRoles } from "../../auth/authRoles";
// import {MatxLoadable} from "../../../matx";
import Loadable from "@loadable/component";
import Loading from "matx/components/MatxLoadable/Loading";

const File =  Loadable(()=>import('./File'),{
  fallback:<Loading/>
})

const outboxRoutes = [
  {
    name:"Outbox",
    path: "/eoffice/outbox/file",
    component: File,
    auth: authRoles.admin
  }
];

export default outboxRoutes;
