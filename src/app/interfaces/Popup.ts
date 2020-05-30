import { FormGroup } from "@angular/forms";
import { Form } from "@cloud-breeze/core";

export interface Popup {
    title: string;
    formNamespace: string;
    description: string;
    confirm: (form: Form ) => void;
    cancel: () => void;
}