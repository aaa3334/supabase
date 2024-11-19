import { wrapperMetaComparator } from 'components/interfaces/Database/Wrappers/Wrappers.utils'
import { useProjectContext } from 'components/layouts/ProjectLayout/ProjectContext'
import { useDatabaseExtensionsQuery } from 'data/database-extensions/database-extensions-query'
import { useFDWsQuery } from 'data/fdw/fdws-query'
import { IntegrationCard } from './IntegrationCard'
import { INTEGRATIONS } from './Integrations.constants'

export const InstalledIntegrations = () => {
  const { project } = useProjectContext()
  const { data, isLoading } = useFDWsQuery({
    projectRef: project?.ref,
    connectionString: project?.connectionString,
  })
  const { data: extensions, isLoading: isLoadingExtensions } = useDatabaseExtensionsQuery({
    projectRef: project?.ref,
    connectionString: project?.connectionString,
  })

  const wrappers = data?.result || []

  if (isLoading) {
    return <div>Loading</div>
  }

  const installedIntegrations = INTEGRATIONS.filter((i) => {
    if (i.type === 'wrapper') {
      return wrappers.find((w) => wrapperMetaComparator(i.meta, w))
    }
    if (i.type === 'postgres_extension') {
      return i.requiredExtensions.every((extName) => {
        const foundExtension = (extensions ?? []).find((ext) => ext.name === extName)
        return !!foundExtension?.installed_version
      })
    }
    return false
  })

  if (installedIntegrations.length === 0) {
    return (
      <div className="px-9 w-full h-48 py-6">
        <div className="border rounded-lg h-full">
          Some placeholder image when no integrations are installed
        </div>
      </div>
    )
  }

  return (
    <div className="px-9 py-6 flex flex-col gap-y-5">
      <h2>Available integrations</h2>
      <div className="flex flex-row flex-wrap gap-x-4 gap-y-3">
        {installedIntegrations.map((i) => (
          <IntegrationCard key={i.id} {...i} />
        ))}
      </div>
    </div>
  )
}
