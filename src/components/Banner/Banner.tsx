import React from 'react';
import './index.less';
import { history } from 'umi';

export default function Banner({
  lessonPage,
  title,
}: {
  lessonPage?: boolean;
  title?: string;
}) {
  return (
    <div className="banner">
      <h1>{lessonPage ? title : 'Solana中文开发教程'}</h1>

      {lessonPage ? (
        ''
      ) : (
        // <div className="back">
        //   <button className="btn" onClick={() => history.push('/')}>
        //     Back to Course
        //   </button>
        //   <button className="btn share">Share on twitter</button>
        // </div>
        <>
          {/* <p className="text-base text-gray-500">by Gametaverse</p> */}

          <p className="desc max-w-2xl md:text-xl">
            Solana作为新一代公链的代表，以高性能和低gas费，深受开发者的青睐，为让更多人拥抱区块链打下了坚实的基础。Solana中文开发教程旨在让更多的中文Solana开发者更好地上手在Solana上进行开发，和我们一起，为未来BUIDL!
          </p>
        </>
      )}
    </div>
  );
}
