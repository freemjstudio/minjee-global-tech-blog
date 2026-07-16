import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Network } from 'lucide-react'
import { Badge } from '@/shared/ui/Badge'
import { formatDateShort } from '@/shared/lib/formatDate'
import type { PostGraph as PostGraphData, PostGraphEdge, PostGraphNode } from '../model/post.types'

const WIDTH = 980
const HEIGHT = 620

const CATEGORY_COLOR: Record<string, string> = {
  backend: '#14b8a6',
  'distributed-systems': '#6366f1',
  'data-engineering': '#f59e0b',
  architecture: '#ec4899',
  'system-design': '#22c55e',
}

const EDGE_COLOR: Record<PostGraphEdge['type'], string> = {
  related: '#0f172a',
  tag: '#94a3b8',
  category: '#cbd5e1',
}

interface PositionedNode extends PostGraphNode {
  x: number
  y: number
}

interface PostGraphProps {
  graph: PostGraphData
}

function shortTitle(title: string) {
  return title.length > 34 ? `${title.slice(0, 31)}...` : title
}

function nodeColor(node: PostGraphNode) {
  return CATEGORY_COLOR[node.category?.slug ?? ''] ?? '#64748b'
}

function getEdgeWeight(edge: PostGraphEdge) {
  if (edge.type === 'related') return 2.4
  return Math.min(1.8, 0.8 + edge.weight * 0.25)
}

function layoutNodes(nodes: PostGraphNode[]): PositionedNode[] {
  if (nodes.length === 1) {
    return [{ ...nodes[0], x: WIDTH / 2, y: HEIGHT / 2 }]
  }

  const grouped = nodes.reduce<Record<string, PostGraphNode[]>>((acc, node) => {
    const key = node.category?.slug ?? 'uncategorized'
    acc[key] = [...(acc[key] ?? []), node]
    return acc
  }, {})

  const categoryKeys = Object.keys(grouped)
  const clusterRadius = 205

  return categoryKeys.flatMap((categoryKey, categoryIndex) => {
    const group = grouped[categoryKey]
    const clusterAngle = -Math.PI / 2 + (Math.PI * 2 * categoryIndex) / categoryKeys.length
    const clusterX = WIDTH / 2 + Math.cos(clusterAngle) * clusterRadius
    const clusterY = HEIGHT / 2 + Math.sin(clusterAngle) * clusterRadius * 0.72
    const localRadius = Math.max(42, Math.min(112, group.length * 32))

    return group.map((node, nodeIndex) => {
      const localAngle = -Math.PI / 2 + (Math.PI * 2 * nodeIndex) / Math.max(group.length, 1)
      return {
        ...node,
        x: clusterX + Math.cos(localAngle) * localRadius,
        y: clusterY + Math.sin(localAngle) * localRadius * 0.86,
      }
    })
  })
}

function connectedNodes(graph: PostGraphData, slug: string) {
  const slugs = graph.edges
    .filter((edge) => edge.source === slug || edge.target === slug)
    .map((edge) => (edge.source === slug ? edge.target : edge.source))

  return graph.nodes.filter((node) => slugs.includes(node.slug))
}

export function PostGraph({ graph }: PostGraphProps) {
  const positionedNodes = useMemo(() => layoutNodes(graph.nodes), [graph.nodes])
  const [selectedSlug, setSelectedSlug] = useState(positionedNodes[0]?.slug ?? '')
  const selectedNode = positionedNodes.find((node) => node.slug === selectedSlug) ?? positionedNodes[0]
  const relatedNodes = selectedNode ? connectedNodes(graph, selectedNode.slug) : []
  const nodeBySlug = new Map(positionedNodes.map((node) => [node.slug, node]))

  if (!selectedNode) return null

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Blog post relationship graph"
          className="aspect-[16/10] w-full bg-[#fbfbfa] dark:bg-gray-950"
        >
          <g>
            {graph.edges.map((edge) => {
              const source = nodeBySlug.get(edge.source)
              const target = nodeBySlug.get(edge.target)
              if (!source || !target) return null

              const active = selectedNode.slug === edge.source || selectedNode.slug === edge.target
              return (
                <line
                  key={`${edge.source}-${edge.target}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={EDGE_COLOR[edge.type]}
                  strokeWidth={active ? getEdgeWeight(edge) + 1 : getEdgeWeight(edge)}
                  strokeOpacity={active ? 0.72 : 0.28}
                />
              )
            })}
          </g>

          <g>
            {positionedNodes.map((node) => {
              const selected = node.slug === selectedNode.slug
              return (
                <g
                  key={node.slug}
                  role="button"
                  tabIndex={0}
                  aria-label={node.title}
                  className="cursor-pointer outline-none"
                  onClick={() => setSelectedSlug(node.slug)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') setSelectedSlug(node.slug)
                  }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={selected ? 12 : 9}
                    fill={nodeColor(node)}
                    opacity={selected ? 1 : 0.82}
                    stroke={selected ? '#0f172a' : '#ffffff'}
                    strokeWidth={selected ? 4 : 2}
                    className="transition-all dark:stroke-gray-950"
                  />
                  <text
                    x={node.x}
                    y={node.y + 33}
                    textAnchor="middle"
                    className="select-none fill-gray-900 text-[18px] font-medium dark:fill-gray-100"
                  >
                    {shortTitle(node.title)}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </section>

      <aside className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">
          <Network className="h-4 w-4" />
          Knowledge Map
        </div>

        <h2 className="mt-4 text-xl font-semibold leading-snug tracking-normal text-gray-900 dark:text-white">
          {selectedNode.title}
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {selectedNode.category && <Badge variant="category">{selectedNode.category.name}</Badge>}
          <span>{formatDateShort(selectedNode.publishedAt)}</span>
          <span>{selectedNode.readingTimeMinutes} min read</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {selectedNode.tags.map((tag) => (
            <Badge key={tag.id}>{tag.name}</Badge>
          ))}
        </div>

        <Link
          to={`/blog/${selectedNode.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-600 transition-colors hover:text-accent-500 dark:text-accent-300"
        >
          Open post
          <ArrowRight className="h-4 w-4" />
        </Link>

        {relatedNodes.length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-5 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
              Connected Posts
            </p>
            <div className="mt-3 space-y-2">
              {relatedNodes.map((node) => (
                <button
                  key={node.slug}
                  type="button"
                  onClick={() => setSelectedSlug(node.slug)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm leading-6 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  {node.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
