## Setting up Dev environment for Portfolio Plans

1. Clone repo, and install dev pre-requisites. See [README file](README.md) for details.
2. Deploy devfabric with Analytics support
```
vssdf sps gallery commerce ems gallery tfs ax
```
3. Enable feature flag to enable `Descendants` support in OData service `3.0-preview`. Enable FF in the Analytics service configuration database.

```
use [Analytics_Configuration]
go
exec prc_SetRegistryValue 1, '#\FeatureAvailability\Entries\Analytics.Transform.WorkItemDescendants\AvailabilityState\', 1
```

4. `iisreset`
5. Build code with `webpack`
```
.\node_modules\.bin\webpack
```
6. Run packaging for DevFabric environment
```
npm run package:dev
```
7. Run dev https server for sources in DevFabric environment:
```
npm run dev
```
8. Create a new publisher called **ms-devlabs** in your devfabric deployment.
9. Upload `.vsix` package as a new extension for **ms-devlabs** publisher.
10. Share the newly-uploaded extension with your devfabric organization.
11. Go to your devfabric organization's shared extensions, and install it.
12. `Portfolio Plans` hub should appear in the `Boards` hub group.
