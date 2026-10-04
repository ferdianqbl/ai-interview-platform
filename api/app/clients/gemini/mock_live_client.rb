# frozen_string_literal: true

module Gemini
  # Development simulator for Gemini Live bidirectional audio WebSocket.
  # Automatically activates in development mode when GEMINI_API_KEY is not configured,
  # allowing local end-to-end testing of the interview UI, voice visualizer, and transcripts.
  class MockLiveClient
    attr_reader :connected, :inactivity_close

    QUESTIONS = [
      "Hello and welcome to your technical interview! To begin, could you introduce yourself and describe a recent web application you built?",
      "That's great context. How do you approach state management and real-time data synchronization between the frontend and backend?",
      "Understood. How do you handle error resilience, WebSocket reconnects, and graceful degradation during network failures?",
      "Could you explain an architectural trade-off you made recently between performance, simplicity, and maintainability?",
      "Thank you for sharing your experience. We have covered all core topics for today's interview session."
    ].freeze

    def initialize(
      system_prompt:,
      on_audio: nil,
      on_input_transcription: nil,
      on_output_transcription: nil,
      on_model_turn_complete: nil,
      on_go_away: nil,
      on_close: nil,
      on_error: nil,
      on_ready: nil,
      on_resumption_token_update: nil
    )
      @system_prompt = system_prompt
      @on_audio = on_audio
      @on_input_transcription = on_input_transcription
      @on_output_transcription = on_output_transcription
      @on_model_turn_complete = on_model_turn_complete
      @on_ready = on_ready
      @connected = false
      @question_index = 0
      @audio_frames_received = 0
      @inactivity_close = false
    end

    def connect(resumption_handle: nil)
      @connected = true
      Rails.logger.info('[Gemini::MockLiveClient] Connected in development simulator mode')
      if defined?(EM) && EM.reactor_running?
        EM.add_timer(0.3) { @on_ready&.call }
      else
        Thread.new do
          sleep 0.3
          @on_ready&.call
        end
      end
    end

    def trigger_opening
      ask_next_question
    end

    def accepting_audio?
      @connected
    end

    def send_audio(_pcm_bytes)
      return unless @connected

      @audio_frames_received += 1
      # After receiving ~60 audio frames (~2 seconds of speech), simulate candidate turn transcription
      if @audio_frames_received == 60
        simulate_candidate_turn
      end
    end

    def inject_context(_text, turn_complete: true)
      true
    end

    def close
      @connected = false
    end

    def supersede!
      @connected = false
    end

    private

    def ask_next_question
      return unless @connected

      question = QUESTIONS[@question_index] || 'Thank you for your responses. The interview session is now complete.'
      @question_index += 1

      schedule_action(0.4) do
        @on_output_transcription&.call(question)
        schedule_action(0.3) do
          @on_model_turn_complete&.call
        end
      end
    end

    def simulate_candidate_turn
      @audio_frames_received = 0
      schedule_action(0.5) do
        @on_input_transcription&.call('I prioritize modular architecture, type safety, and optimistic updates to ensure a smooth user experience.')
        schedule_action(1.2) do
          ask_next_question
        end
      end
    end

    def schedule_action(delay, &block)
      if defined?(EM) && EM.reactor_running?
        EM.add_timer(delay, &block)
      else
        Thread.new do
          sleep delay
          block.call
        end
      end
    end
  end
end
