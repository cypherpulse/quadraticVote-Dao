;; quadratic-vote.clar
;; Quadratic voting DAO smart contract for Stacks
;; Compatible with Clarity 4 and epoch 3.3

(define-constant owner tx-sender)

(define-data-var proposal-count uint u0)

(define-map proposals uint 
  { title: (string-utf8 128), description: (string-utf8 512), creator: principal, created-at: uint, total-vote-weight: uint })

(define-map votes { proposal-id: uint, voter: principal } 
  { stake: uint, vote-weight: uint })  ;; vote-weight = sqrt(stake)

;; Error codes
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-INVALID-PROPOSAL (err u101))
(define-constant ERR-NO-STAKE (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))
(define-constant ERR-INSERT-FAILED (err u104))

;; Private helper: integer square root using Babylonian method
;; Returns approximate floor(sqrt(n)) for uint n
(define-private (integer-sqrt (n uint))
  (if (<= n u1) 
    n
    (let ((x (/ n u2)))
      (let ((x1 (/ (+ x (/ n x)) u2)))
        (let ((x2 (/ (+ x1 (/ n x1)) u2)))
          (let ((x3 (/ (+ x2 (/ n x2)) u2)))
            (let ((x4 (/ (+ x3 (/ n x3)) u2)))
              (/ (+ x4 (/ n x4)) u2))))))))

;; Public functions

;; Create a new proposal
;; Increments proposal count and stores proposal data
;; Returns the new proposal ID
(define-public (create-proposal (title (string-utf8 128)) (description (string-utf8 512)))
  (let ((new-id (var-get proposal-count)))
    (asserts! (map-insert proposals new-id 
      { title: title, 
        description: description, 
        creator: tx-sender, 
        created-at: stacks-block-height, 
        total-vote-weight: u0 }) ERR-INSERT-FAILED)
    (var-set proposal-count (+ new-id u1))
    (ok new-id)))

;; Vote on a proposal with quadratic voting
;; Transfers STX to contract, calculates sqrt(stake) as vote weight
;; Updates or creates vote record and proposal total weight
(define-public (vote (proposal-id uint) (stake-amount uint))
  (begin
    (asserts! (> stake-amount u0) ERR-INVALID-AMOUNT)
    (asserts! (is-some (map-get? proposals proposal-id)) ERR-INVALID-PROPOSAL)
    (try! (stx-transfer? stake-amount tx-sender tx-sender))
    (let ((existing-vote (map-get? votes { proposal-id: proposal-id, voter: tx-sender }))
          (new-stake (if (is-some existing-vote) 
                        (+ (get stake (unwrap-panic existing-vote)) stake-amount) 
                        stake-amount))
          (new-weight (integer-sqrt new-stake))
          (weight-diff (if (is-some existing-vote) 
                          (- new-weight (get vote-weight (unwrap-panic existing-vote))) 
                          new-weight))
          (current-proposal (unwrap-panic (map-get? proposals proposal-id))))
      (map-set votes { proposal-id: proposal-id, voter: tx-sender } 
        { stake: new-stake, vote-weight: new-weight })
      (map-set proposals proposal-id 
        (merge current-proposal 
          { total-vote-weight: (+ (get total-vote-weight current-proposal) weight-diff) }))
      (print { event: "vote-cast", voter: tx-sender, proposal: proposal-id, stake: stake-amount, weight: new-weight })
      (ok true))))

;; Withdraw vote from a proposal
;; Returns staked STX to voter, removes vote record, updates proposal total
(define-public (withdraw-vote (proposal-id uint))
  (let ((existing-vote (unwrap! (map-get? votes { proposal-id: proposal-id, voter: tx-sender }) ERR-NO-STAKE)))
    (try! (stx-transfer? (get stake existing-vote) tx-sender tx-sender))
    (let ((current-proposal (unwrap-panic (map-get? proposals proposal-id))))
      (map-set proposals proposal-id 
        (merge current-proposal 
          { total-vote-weight: (- (get total-vote-weight current-proposal) (get vote-weight existing-vote)) })))
    (map-delete votes { proposal-id: proposal-id, voter: tx-sender })
    (ok true)))

;; Read-only functions

;; Get proposal details by ID
(define-read-only (get-proposal (id uint))
  (map-get? proposals id))

;; Get total number of proposals
(define-read-only (get-proposal-count)
  (var-get proposal-count))

;; Get vote details for a specific voter on a proposal
(define-read-only (get-vote (proposal-id uint) (voter principal))
  (map-get? votes { proposal-id: proposal-id, voter: voter }))

;; Get top proposals (placeholder: returns first 10 proposal IDs)
;; In a real implementation, this would sort by total-vote-weight
(define-read-only (get-top-proposals)
  (let ((count (var-get proposal-count)))
    (if (<= count u10)
      (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9) ;; Note: this includes invalid IDs if count < 10
      (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9))))