import { createProject, createCustomTask, advanceStage, deleteProject, markProjectCompleted } from '../actions'

const STAGES = ['Composer', 'Sound Designer', 'Arranger', 'FX Mixer', 'Mastering Engineer', 'Completed']
const getNextStage = (current) => STAGES[STAGES.indexOf(current) + 1]

export default function AdminTasksView({ projects }) {
  return (
    <>
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>Create New Project</h2>
        <form action={createProject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Project Title</label>
            <input name="title" className="input-control" required placeholder="E.g., Summer Anthem 2026" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Instructions & Specs</label>
            <textarea name="description" className="input-control" rows="3"></textarea>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Initial Stem/Resource Link (URL)</label>
            <input name="file_url" className="input-control" placeholder="https://..." />
          </div>
          <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Initiate Project Pipeline</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '8px' }}>Create Custom Standalone Task</h2>
        <p style={{ color: '#86868b', marginBottom: '24px', fontSize: '14px' }}>Bypass the pipeline and dispatch an independent task directly to specific specializations.</p>
        <form action={createCustomTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Task Title</label>
            <input name="title" className="input-control" required placeholder="E.g., Emergency Vocal Edit" />
          </div>

          <div className="input-group" style={{ marginBottom: '8px' }}>
            <label style={{ marginBottom: '12px', display: 'block' }}>Target Specializations</label>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {STAGES.filter(s => s !== 'Completed').map(st => (
                <label key={st} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" name="specializations" value={st} />
                  <span style={{ fontSize: '14px' }}>{st}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Instructions & Specs</label>
            <textarea name="description" className="input-control" rows="3" required></textarea>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Asset Link (URL)</label>
            <input name="file_url" className="input-control" placeholder="https://..." />
          </div>
          <button className="btn btn-secondary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Dispatch Custom Task</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>Active Projects</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {projects?.map(p => (
            <div key={p.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <strong style={{ fontSize: '20px' }}>{p.title}</strong>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{
                    background: p.status === 'completed' ? 'var(--success)' : 'var(--primary)',
                    color: p.status === 'completed' ? '#fff' : '#000',
                    padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '500'
                  }}>
                    {p.current_stage.toUpperCase()}
                  </span>

                  <form action={markProjectCompleted} style={{ display: 'inline' }}>
                    <input type="hidden" name="project_id" value={p.id} />
                    <button type="submit" disabled={p.status === 'completed'} className="btn" style={{ padding: '4px 10px', fontSize: '11px', background: p.status === 'completed' ? 'rgba(255,255,255,0.1)' : 'rgba(52, 199, 89, 0.1)', color: p.status === 'completed' ? '#86868b' : '#34c759' }}>
                      {p.status === 'completed' ? 'Finished' : 'Mark Done'}
                    </button>
                  </form>

                  <form action={deleteProject} style={{ display: 'inline', marginLeft: '4px' }}>
                    <input type="hidden" name="project_id" value={p.id} />
                    <button type="submit" className="btn" style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(255, 69, 58, 0.1)', color: '#ff453a' }}>
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              <h4 style={{ marginBottom: '12px', color: '#86868b' }}>Project Stages:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {p.tasks?.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)).map(t => (
                  <div key={t.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${t.status === 'completed' ? 'var(--success)' : 'var(--warning)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '15px' }}>{t.stage}</strong>
                        <span style={{ fontSize: '13px', color: '#86868b' }}>
                          {t.producer_id ? `Assigned to: ${t.profiles?.name || 'Unknown'}` : 'Unassigned'} |
                          Status: {t.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {t.producer_file_url && (
                            <a href={t.producer_file_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--success)' }}>📥 View Work</a>
                        )}
                        {t.status === 'completed' && t.stage === p.current_stage && t.stage !== 'Completed' && p.status !== 'completed' && (
                            <form action={advanceStage}>
                              <input type="hidden" name="project_id" value={p.id} />
                              <input type="hidden" name="current_stage" value={t.stage} />
                              <input type="hidden" name="next_stage" value={getNextStage(t.stage)} />
                              <input type="hidden" name="file_url" value={t.producer_file_url} />
                              <button className="btn btn-primary" type="submit" style={{ padding: '6px 12px', fontSize: '12px' }}>Advance to {getNextStage(t.stage)}</button>
                            </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {(!projects || projects.length === 0) && (
            <p style={{ color: '#86868b', textAlign: 'center' }}>No active projects.</p>
          )}
        </div>
      </div>
    </>
  )
}
