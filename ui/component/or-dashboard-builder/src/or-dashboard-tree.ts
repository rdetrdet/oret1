import {css, html, LitElement} from "lit";
import { customElement, property} from "lit/decorators.js";
import {InputType} from '@openremote/or-mwc-components/or-mwc-input';
import "@openremote/or-icon";
import {style} from "./style";
import 'gridstack/dist/h5/gridstack-dd-native';
import { Dashboard, DashboardScalingPreset, DashboardScreenPreset} from "@openremote/model";
import manager from "@openremote/core";
import {ListItem} from "@openremote/or-mwc-components/or-mwc-list";
import "@openremote/or-mwc-components/or-mwc-menu";
import { getContentWithMenuTemplate } from "@openremote/or-mwc-components/or-mwc-menu";

//language=css
const treeStyling = css`
`;
enum DashboardSizeOption {
    LARGE, MEDIUM, SMALL
}

@customElement("or-dashboard-tree")
export class OrDashboardTree extends LitElement {

    // Importing Styles; the unsafe GridStack css, and all custom css
    static get styles() {
        return [style, treeStyling];
    }

    @property()
    private dashboards: Dashboard[] | undefined;

    @property()
    private selected: Dashboard | undefined;

    @property()
    public editMode: boolean = true;


    /* --------------- */

    constructor() {
        super();
        this.updateComplete.then(async () => {
            if(this.dashboards == undefined) {
                await this.getAllDashboards();
            }
        });
    }

    private async getAllDashboards() {
        return manager.rest.api.DashboardResource.getAllUserDashboards().then((result) => {
            this.dashboards = result.data;
        });
    }

    updated(changedProperties: Map<string, any>) {
        console.log(changedProperties);
        if(changedProperties.has("dashboards")) {
            this.dispatchEvent(new CustomEvent("updated", { detail: this.dashboards }));
        }
        if(changedProperties.has("selected") && this.selected != undefined) {
            this.dispatchEvent(new CustomEvent("select", { detail: this.selected }));
        }
    }


    /* ---------------------- */

    private createDashboard(size: DashboardSizeOption) {
        const dashboard = {
            realm: manager.displayRealm,
            displayName: "Dashboard" + (this.dashboards != null ? (this.dashboards.length + 1) : "X"),
            template: {
                columns: this.getDefaultColumns(size),
                maxScreenWidth: 4000,
                screenPresets: this.getDefaultScreenPresets(size),
            }
        } as Dashboard
        manager.rest.api.DashboardResource.create(dashboard).then((response => {
            if(response.status == 200) {
                console.log(response); // expects a dashboard response
                this.dashboards?.push(response.data as Dashboard);
                this.requestUpdate("dashboards");
                this.dispatchEvent(new CustomEvent("created", { detail: response.data }));

                // Select the item that was created
                this.selected = this.dashboards?.find((x) => { return x.id == response.data.id; });
            }
        }))
    }

    private selectDashboard(id: string) {
        this.selected = this.dashboards?.find((dashboard) => { return dashboard.id == id; });
    }

    private deleteDashboard(dashboard: Dashboard) {
        if(dashboard.id != null) {
            manager.rest.api.DashboardResource.delete({dashboardId: [dashboard.id]}).then((response) => {
                console.log(response);
                if(response.status == 204) {
                    this.getAllDashboards();
                }
            })
        }
    }

    /* ---------------------- */

    protected render() {
        const menuItems: ListItem[] = [
            { icon: "monitor", text: "Large", value: DashboardSizeOption.LARGE },
            { icon: "tablet", text: "Medium", value: DashboardSizeOption.MEDIUM },
            { icon: "cellphone", text: "Small", value: DashboardSizeOption.SMALL }
        ]
        const dashboardItems: ListItem[] = [];
        if(this.dashboards != null && this.dashboards.length > 0) {
            this.dashboards?.forEach((dashboard) => { dashboardItems.push({ icon: "view-dashboard", text: dashboard.displayName, value: dashboard.id})})
        }
        return html`
            <div id="menu-header">
                <div id="title-container">
                    <span id="title">Dashboards</span>
                </div>
                ${this.editMode ? html`
                    <div>
                        <or-mwc-input type="${InputType.BUTTON}" icon="delete" style="margin-right: -4px;" @click="${() => { if(this.selected != null) { this.deleteDashboard(this.selected); }}}"></or-mwc-input>
                        <span style="--or-icon-fill: black">
                            ${getContentWithMenuTemplate(
                                html`<or-mwc-input type="${InputType.BUTTON}" icon="plus" style="margin-left: -4px; --or-icon-fill: white;"></or-mwc-input>`,
                                menuItems, "monitor", (value: DashboardSizeOption) => { this.createDashboard(value); }
                            )}                        
                        </span>
                    </div>
                ` : undefined}
            </div>
            <div id="content">
                <div>
                    ${(dashboardItems.length > 0) ? html`
                    <or-mwc-list .listItems="${dashboardItems}" .values="${this.selected?.id}" @or-mwc-list-changed="${(event: CustomEvent) => { if(event.detail.length == 1) { this.selectDashboard(event.detail[0].value); }}}"></or-mwc-list>
                ` : html`
                    <span>No dashboards found!</span>
                `
                    }
                </div>
            </div>
        `
    }



    /* ------------------ */

    // TODO: Needs to be moved to probably model itself
    private getDefaultColumns(preset: DashboardSizeOption): number {
        switch (preset) {
            case DashboardSizeOption.SMALL: { return 4; }
            case DashboardSizeOption.MEDIUM: { return 8; }
            case DashboardSizeOption.LARGE: { return 12; }
        }
    }

    // TODO: Needs to be moved to probably model itself
    private getDefaultScreenPresets(preset: DashboardSizeOption): DashboardScreenPreset[] {
        switch (preset) {
            case DashboardSizeOption.LARGE: {
                return [{
                    id: "large",
                    displayName: "Large",
                    breakpoint: 1000000, // TODO: change this
                    scalingPreset: DashboardScalingPreset.RESIZE_WIDGETS
                }, {
                    id: "medium",
                    displayName: "Medium",
                    breakpoint: 1280,
                    scalingPreset: DashboardScalingPreset.RESIZE_WIDGETS
                }, {
                    id: "small",
                    displayName: "Small",
                    breakpoint: 640,
                    scalingPreset: DashboardScalingPreset.WRAP_TO_SINGLE_COLUMN
                }];
            }
            case DashboardSizeOption.MEDIUM: {
                return [{
                    id: "large",
                    displayName: "Large",
                    breakpoint: 1000000,
                    scalingPreset: DashboardScalingPreset.RESIZE_WIDGETS
                }, {
                    id: "medium",
                    displayName: "Medium",
                    breakpoint: 1280,
                    scalingPreset: DashboardScalingPreset.RESIZE_WIDGETS
                }, {
                    id: "small",
                    displayName: "Small",
                    breakpoint: 640,
                    scalingPreset: DashboardScalingPreset.WRAP_TO_SINGLE_COLUMN
                }];
            }
            case DashboardSizeOption.SMALL: {
                return [{
                    id: "large",
                    displayName: "Large",
                    breakpoint: 1000000,
                    scalingPreset: DashboardScalingPreset.RESIZE_WIDGETS
                }, {
                    id: "medium",
                    displayName: "Medium",
                    breakpoint: 1280,
                    scalingPreset: DashboardScalingPreset.RESIZE_WIDGETS
                }, {
                    id: "small",
                    displayName: "Small",
                    breakpoint: 640,
                    scalingPreset: DashboardScalingPreset.WRAP_TO_SINGLE_COLUMN
                }];
            }
        }
    }
}
