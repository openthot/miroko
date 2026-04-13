import { completeTask, acceptTask } from '../actions'

export default function ProducerTasksView({ myTasks, availableTasks, allOtherTasks, userSpecialization, profile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>My Assigned Tasks</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {myTasks?.length > 0 ? myTasks.map(t => (
            <div key={t.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '18px' }}>{t.projects?.title || t.title} <span style={{ color: '#86868b', fontSize: '14px', marginLeft: '8px' }}>({t.stage || 'Legacy Task'})</span></strong>
                <span style={{ fontSize: '14px', color: '#86868b' }}>Due: {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No deadline'}</span>
              </div>
              <p style={{ color: 'var(--foreground)', opacity: 0.9, marginBottom: '16px' }}>{t.description}</p>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {t.admin_file_url && (
                  <a href={t.admin_file_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>Download Resources</a>
                )}

                {t.status !== 'completed' ? (
                  <form action={completeTask} style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <input type="hidden" name="task_id" value={t.id} />
                    <input name="producer_file_url" type="url" className="input-control" placeholder="Paste file link (Drive, Dropbox URL)" required style={{ padding: '6px 12px', fontSize: '13px', minWidth: '220px' }} />
                    <button className="btn btn-primary" type="submit" style={{ padding: '6px 14px', fontSize: '13px' }}>Submit Work</button>
                  </form>
                ) : (
                  <span style={{ fontSize: '13px', color: '#86868b', marginLeft: 'auto' }}>
                    Submitted: <a href={t.producer_file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View Link</a>
                  </span>
                )}
              </div>
            </div>
          )) : (
            <p style={{ color: '#86868b' }}>You have no assigned tasks.</p>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '8px' }}>Available Projects ({userSpecialization})</h2>
        <p style={{ color: '#86868b', marginBottom: '24px', fontSize: '14px' }}>First to accept is locked to the project.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {availableTasks?.length > 0 ? availableTasks.map(t => (
            <div key={t.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '18px' }}>{t.projects?.title || t.title}</strong>
                <form action={acceptTask}>
                  <input type="hidden" name="task_id" value={t.id} />
                  <button className="btn btn-primary" type="submit" style={{ padding: '6px 14px', fontSize: '13px' }}>Accept & Lock</button>
                </form>
              </div>
              <p style={{ color: 'var(--foreground)', opacity: 0.9, fontSize: '14px' }}>{t.description}</p>
            </div>
          )) : (
            <p style={{ color: '#86868b' }}>No projects available for your specialization at the moment.</p>
          )}
        </div>
      </div>

      {profile?.tier === 'premium' && (
        <div className="glass-panel" style={{ padding: '40px', borderColor: 'var(--primary)' }}>
          <h2 style={{ marginBottom: '8px', color: 'var(--primary)' }}>Premium: Complete Catalogue</h2>
          <p style={{ color: '#86868b', marginBottom: '24px', fontSize: '14px' }}>As a Premium Artist, you see all available projects globally.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {allOtherTasks?.length > 0 ? allOtherTasks.map(t => (
            <div key={t.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '18px' }}>{t.projects?.title || t.title} <span style={{ color: 'var(--primary)', fontSize: '12px' }}>({t.stage})</span></strong>
                <form action={acceptTask}>
                  <input type="hidden" name="task_id" value={t.id} />
                  <button className="btn btn-primary" type="submit" style={{ padding: '6px 14px', fontSize: '13px' }}>Accept & Lock</button>
                </form>
              </div>
            </div>
          )) : (
            <p style={{ color: '#86868b' }}>No other projects available.</p>
          )}
        </div>
        </div>
      )}
    </div>
  )
}
