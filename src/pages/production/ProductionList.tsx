import { useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { songsApi } from '../../shared/apis/songs/songsApi';
import ConfirmModal from '../../shared/components/modal/ConfirmModal';
import PageHeader from '../../shared/components/header/PageHeader';
import AnimatedGradientBackground from '../../shared/styles/AnimatedGradientBackground/AnimatedGradientBackground';
import type { Song } from '../../shared/types/song';
import { isLoggedIn } from '../../shared/utils/authStorage';
import './ProductionList.css';

function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8ZM7 5V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V5H22V7H2V5H7ZM9 4V5H15V4H9ZM9 12V18H11V12H9ZM13 12V18H15V12H13Z" />
    </svg>
  );
}

export default function ProductionList() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Song | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
      return;
    }

    songsApi
      .list('in_progress')
      .then((res) => setSongs(res.data.songs))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDeleteClick = (e: MouseEvent, song: Song) => {
    e.stopPropagation();
    setPendingDelete(song);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete || deleting) return;

    setDeleting(true);
    try {
      await songsApi.delete(pendingDelete.id);
      setSongs((prev) => prev.filter((s) => s.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch {
      alert('삭제에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatedGradientBackground variant="auth" className="production-list">
      <PageHeader title="제작 진행 현황" onBack={() => navigate('/my')} />

      <main className="production-list__main">
        {loading ? (
          <p className="production-list__empty">불러오는 중...</p>
        ) : songs.length > 0 ? (
          <div className="production-list__items">
            {songs.map((song) => (
              <article
                key={song.id}
                className="production-list__card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/create/${song.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/create/${song.id}`);
                }}
              >
                <div className="production-list__card-top">
                  <div className="production-list__info">
                    <h3 className="production-list__title">{song.title}</h3>
                    <p className="production-list__meta">{song.step}</p>
                  </div>
                  <button
                    type="button"
                    className="production-list__delete"
                    aria-label={`${song.title} 삭제`}
                    onClick={(e) => handleDeleteClick(e, song)}
                  >
                    <DeleteIcon />
                  </button>
                </div>
                <div className="production-list__progress">
                  <div
                    className="production-list__progress-bar"
                    style={{ width: `${song.progress}%` }}
                  />
                </div>
                <span className="production-list__percent">{song.progress}%</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="production-list__empty">제작 중인 곡이 없어요.</p>
        )}
      </main>

      <ConfirmModal
        open={!!pendingDelete}
        message="작업 중인 곡을 삭제하시겠습니까?"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </AnimatedGradientBackground>
  );
}
