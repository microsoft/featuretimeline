import React = require("react");
import { CSSTransitionGroup } from "react-transition-group";
import { IRenderFunction, css } from "office-ui-fabric-react/lib/Utilities";

export interface ICollapsiblePanelProps {
    contentKey: string;

    /** Label to show in header */
    headerLabel?: string;

    /** Optional class name to apply to header */
    headerClassName?: string;

    /** Optional method to customize rendering the header */
    onRenderHeader?: IRenderFunction<string>;

    /** Value indicating whether the control is initially expanded */
    initialIsExpanded?: boolean;

    /** Value indicating whether the control can be collapsed */
    isCollapsible: boolean;

    /** Callback when the control is collapsed/expanded */
    onToggle?: (isExpanded: boolean) => void;

    /** Callback to render content */
    renderContent: (key: string) => JSX.Element;

    /** If set, uses CSS transitions to animate expand/collapsed */
    animate?: boolean;

    /** Duration of CSS transition */
    animationDurationInMs?: number;

    /** Value indicating whether the initial appear should be animated */
    animateAppear?: boolean;

    /** Classname to use for animation. Follows React's CSSTransitionGroup conventions */
    animateClassName?: string;

    /** Indicates that we should always render the contents of the panel even if it is initially collapsed */
    alwaysRenderContents?: boolean;

    /** Additional css classes to add to the group */
    className?: string;
}

export interface ICollapsiblePanelState {
    isExpanded: boolean;
}

/**
 * Generic collapsible panel
 */
export class CollapsiblePanel extends React.Component<ICollapsiblePanelProps, ICollapsiblePanelState> {
    private _onToggle = () => {
        this._toggle();
    };

    private _content: JSX.Element;

    constructor(props) {
        super(props);

        this.state = {
            isExpanded: !this.props.isCollapsible || this.props.initialIsExpanded
        };
    }

    public render(): JSX.Element {
        const shouldRenderContent = this.state.isExpanded || this.props.alwaysRenderContents;

        if (shouldRenderContent && !this._content) {
            this._content = this.props.renderContent(this.props.contentKey);
        }

        return (
            <div className={css("grid-group-container", this.props.className)}>
                <div className="grid-group">
                    {this._renderHeader()}

                    {this.props.animate ? (
                        <CSSTransitionGroup
                            className="tfs-collapsible-content-wrapper"
                            component="div"
                            transitionAppear={this.props.animateAppear}
                            transitionAppearTimeout={this.props.animationDurationInMs}
                            transitionEnterTimeout={this.props.animationDurationInMs}
                            transitionLeaveTimeout={this.props.animationDurationInMs}
                            transitionName={this.props.animateClassName}
                        >
                            {this._content != null && shouldRenderContent ? this._renderContent() : null}
                        </CSSTransitionGroup>
                    ) : this._content != null ? (
                        this._renderContent()
                    ) : null}
                </div>
            </div>
        );
    }

    protected _renderContent(): JSX.Element {
        const style = { display: this.state.isExpanded ? "" : "none" };

        return (
            <div className="tfs-collapsible-content" style={style}>
                {this._content}
            </div>
        );
    }

    protected _renderHeader(): JSX.Element {
        const { headerLabel, headerClassName, onRenderHeader = this._onRenderHeaderLabel } = this.props;

        let toggleHandler: React.EventHandler<React.MouseEvent<HTMLElement>> = null;
        if (this.props.isCollapsible) {
            toggleHandler = this._onToggle;
        }

        const toggleClasses = css("tfs-collapsible-collapse", "icon", "bowtie-icon", {
            "bowtie-chevron-up": this.state.isExpanded,
            "bowtie-chevron-down": !this.state.isExpanded
        });

        return (
            <div role="heading" aria-level={2}>
                <button
                    className={css("tfs-collapsible-header", headerClassName, {
                        "group-expanded": this.state.isExpanded,
                        "group-collapsed": !this.state.isExpanded
                    })}
                    aria-expanded={this.state.isExpanded}
                    onClick={toggleHandler}
                >
                    <span className="tfs-collapsible-text">{onRenderHeader(headerLabel, this._renderHeaderLabel)}</span>
                    <span
                        className={toggleClasses}
                        style={{
                            display: !this.props.isCollapsible ? "none" : null
                        }}
                    />
                </button>
            </div>
        );
    }

    protected _onRenderHeaderLabel = (label: string): JSX.Element => {
        return this._renderHeaderLabel(label);
    };

    protected _renderHeaderLabel = (label: string): JSX.Element => {
        return <span>{label}</span>;
    };

    protected _toggle(): void {
        if (!this.props.isCollapsible) {
            return;
        }

        const isExpanded = this.state.isExpanded;

        this.setState({
            isExpanded: !isExpanded
        });

        if (this.props.onToggle) {
            this.props.onToggle(!isExpanded);
        }
    }
}
