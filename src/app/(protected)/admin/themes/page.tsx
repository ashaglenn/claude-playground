'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface CustomTheme {
  id: string
  name: string
  description: string | null
  default_background: string | null
  name_entry_background: string | null
  welcome_background: string | null
  hub_background: string | null
  question_background: string | null
  correct_background: string | null
  teaching_background: string | null
  reflection_background: string | null
  reflection_wrong_background: string | null
  is_active: boolean
}

const BACKGROUND_FIELDS = [
  { key: 'default_background', label: 'Default (fallback for all screens)' },
  { key: 'name_entry_background', label: 'Name Entry Screen' },
  { key: 'welcome_background', label: 'Welcome Screen' },
  { key: 'hub_background', label: 'Game Hub' },
  { key: 'question_background', label: 'Question Screen' },
  { key: 'correct_background', label: 'Correct Answer Screen' },
  { key: 'teaching_background', label: 'Teaching Screen (wrong answer)' },
  { key: 'reflection_background', label: 'Reflection Question' },
  { key: 'reflection_wrong_background', label: 'Wrong Reflection Answer' },
] as const

type BackgroundField = typeof BACKGROUND_FIELDS[number]['key']

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<CustomTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUploadField, setCurrentUploadField] = useState<BackgroundField | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkAdminAndLoadThemes()
  }, [])

  const checkAdminAndLoadThemes = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    loadThemes()
  }

  const loadThemes = async () => {
    const { data, error } = await supabase
      .from('custom_themes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setThemes(data)
    }
    setLoading(false)
  }

  const createEmptyTheme = (): CustomTheme => ({
    id: '',
    name: '',
    description: '',
    default_background: null,
    name_entry_background: null,
    welcome_background: null,
    hub_background: null,
    question_background: null,
    correct_background: null,
    teaching_background: null,
    reflection_background: null,
    reflection_wrong_background: null,
    is_active: true,
  })

  const handleCreate = () => {
    setEditingTheme(createEmptyTheme())
    setIsCreating(true)
  }

  const handleEdit = (theme: CustomTheme) => {
    setEditingTheme({ ...theme })
    setIsCreating(false)
  }

  const handleCancel = () => {
    setEditingTheme(null)
    setIsCreating(false)
  }

  const handleSave = async () => {
    if (!editingTheme || !editingTheme.name.trim()) return

    setSaving(true)

    const themeData = {
      name: editingTheme.name,
      description: editingTheme.description,
      default_background: editingTheme.default_background,
      name_entry_background: editingTheme.name_entry_background,
      welcome_background: editingTheme.welcome_background,
      hub_background: editingTheme.hub_background,
      question_background: editingTheme.question_background,
      correct_background: editingTheme.correct_background,
      teaching_background: editingTheme.teaching_background,
      reflection_background: editingTheme.reflection_background,
      reflection_wrong_background: editingTheme.reflection_wrong_background,
      is_active: editingTheme.is_active,
    }

    if (isCreating) {
      const { error } = await supabase
        .from('custom_themes')
        .insert(themeData)

      if (!error) {
        await loadThemes()
        setEditingTheme(null)
        setIsCreating(false)
      }
    } else {
      const { error } = await supabase
        .from('custom_themes')
        .update({ ...themeData, updated_at: new Date().toISOString() })
        .eq('id', editingTheme.id)

      if (!error) {
        await loadThemes()
        setEditingTheme(null)
      }
    }

    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return

    await supabase.from('custom_themes').delete().eq('id', id)
    await loadThemes()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUploadField || !editingTheme) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB')
      return
    }

    setUploadingField(currentUploadField)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `theme-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('Images')
        .upload(fileName, file)

      if (uploadError) {
        alert(`Upload failed: ${uploadError.message}`)
        setUploadingField(null)
        return
      }

      const { data } = supabase.storage
        .from('Images')
        .getPublicUrl(fileName)

      setEditingTheme(prev => prev ? {
        ...prev,
        [currentUploadField]: data.publicUrl
      } : prev)
    } catch {
      alert('Failed to upload image')
    }

    setUploadingField(null)
    setCurrentUploadField(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (field: BackgroundField) => {
    setEditingTheme(prev => prev ? { ...prev, [field]: null } : prev)
  }

  const triggerUpload = (field: BackgroundField) => {
    setCurrentUploadField(field)
    fileInputRef.current?.click()
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black">
              ← Back to Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold">Theme Manager</h1>
          </div>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-black px-6 py-2 font-medium text-white hover:bg-gray-800"
          >
            + Create Theme
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Theme Editor Modal */}
        {editingTheme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
              <h2 className="mb-4 text-xl font-bold">
                {isCreating ? 'Create New Theme' : 'Edit Theme'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Theme Name *
                  </label>
                  <input
                    type="text"
                    value={editingTheme.name}
                    onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="e.g., Enchanted Forest"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingTheme.description || ''}
                    onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="A magical forest theme..."
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="mb-3 font-medium text-gray-900">Background Images</h3>
                  <p className="mb-4 text-xs text-gray-500">
                    Upload background images for each screen. If a screen doesn&apos;t have a specific background, it will use the default.
                  </p>

                  <div className="space-y-3">
                    {BACKGROUND_FIELDS.map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-48 text-sm text-gray-700">{label}</div>
                        <div className="flex-1">
                          {editingTheme[key] ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="h-10 w-20 rounded border bg-cover bg-center"
                                style={{ backgroundImage: `url(${editingTheme[key]})` }}
                              />
                              <button
                                onClick={() => triggerUpload(key)}
                                disabled={uploadingField === key}
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                {uploadingField === key ? 'Uploading...' : 'Change'}
                              </button>
                              <button
                                onClick={() => handleRemoveImage(key)}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => triggerUpload(key)}
                              disabled={uploadingField === key}
                              className="rounded border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500 hover:border-gray-400"
                            >
                              {uploadingField === key ? 'Uploading...' : 'Upload image'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t pt-4">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editingTheme.is_active}
                    onChange={(e) => setEditingTheme({ ...editingTheme, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Theme is active (visible to teachers)
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editingTheme.name.trim()}
                  className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Theme'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Theme List */}
        {themes.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-600">No custom themes yet.</p>
            <button
              onClick={handleCreate}
              className="mt-4 rounded-lg bg-black px-6 py-2 font-medium text-white hover:bg-gray-800"
            >
              Create Your First Theme
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className="rounded-lg border-2 border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">{theme.name}</h2>
                      {!theme.is_active && (
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    {theme.description && (
                      <p className="mt-1 text-sm text-gray-500">{theme.description}</p>
                    )}
                    <div className="mt-2 flex gap-2">
                      {theme.default_background && (
                        <div
                          className="h-8 w-12 rounded border bg-cover bg-center"
                          style={{ backgroundImage: `url(${theme.default_background})` }}
                          title="Default background"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(theme)}
                      className="rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(theme.id)}
                      className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
