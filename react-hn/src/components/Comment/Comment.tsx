import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentType } from '../../models/types';
import './Comment.scss';

interface CommentProps {
  comment: CommentType;
}

export default function Comment({ comment }: CommentProps) {
  const [collapse, setCollapse] = useState(false);

  if (comment.deleted) {
    return (
      <div>
        <div className="deleted-meta">
          <span className="collapse">[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
        <span className="collapse" onClick={() => setCollapse(!collapse)}>
          [{collapse ? '+' : '-'}]
        </span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        {!collapse && (
          <div>
            <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
            <ul className="subtree">
              {comment.comments &&
                comment.comments.map(subComment => (
                  <li key={subComment.id}>
                    <Comment comment={subComment} />
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
